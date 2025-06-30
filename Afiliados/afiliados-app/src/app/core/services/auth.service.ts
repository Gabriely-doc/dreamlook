import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = new BehaviorSubject<any>(null);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private supabaseService: SupabaseService) {
    // Verificar se há usuário logado ao inicializar
    this.checkCurrentUser();
    
    // Escutar mudanças de autenticação
    this.supabaseService.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.handleUserSignIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.handleUserSignOut();
      }
    });
  }

  get currentUser(): any {
    return this._currentUser.value;
  }

  get currentUser$(): Observable<any> {
    return this._currentUser.asObservable();
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }

  get isAuthenticated$(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  private async checkCurrentUser() {
    try {
      const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
      if (session?.user) {
        await this.handleUserSignIn(session.user);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
    }
  }

  private async handleUserSignIn(authUser: any) {
    try {
      // Buscar dados completos do usuário na tabela pública
      // O trigger já deve ter criado o registro, mas vamos aguardar um pouco
      await this.waitForUserProfile(authUser.id);
      
      const { data: publicUser, error } = await this.supabaseService.supabase
        .from('users')
        .select(`
          *,
          user_roles!inner(
            roles!inner(name, permissions)
          )
        `)
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil público:', error);
        // Fallback: usar dados do auth se não encontrar na tabela pública
        this._currentUser.next({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email,
          roles: ['user']
        });
      } else {
        // Extrair roles do usuário
        const roles = publicUser.user_roles?.map((ur: any) => ur.roles.name) || ['user'];
        
        this._currentUser.next({
          ...publicUser,
          roles: roles
        });
      }
      
      this._isAuthenticated.next(true);
    } catch (error) {
      console.error('Erro ao processar login:', error);
      this._currentUser.next(null);
      this._isAuthenticated.next(false);
    }
  }

  private async waitForUserProfile(userId: string, maxAttempts: number = 5) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data } = await this.supabaseService.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (data) {
        return; // Perfil encontrado
      }
      
      // Aguardar um pouco antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }

  private handleUserSignOut() {
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
  }

  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // O handleUserSignIn será chamado automaticamente pelo onAuthStateChange
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }

  async signUpWithEmail(email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Se o usuário foi criado com sucesso, o trigger automaticamente
      // criará o registro na tabela pública
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }

  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabaseService.supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      // O handleUserSignOut será chamado automaticamente pelo onAuthStateChange
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }

  isAdmin(): boolean {
    const user = this._currentUser.value;
    return user?.roles.includes('admin');
  }

  // Método para atualizar perfil do usuário
  async updateProfile(updates: { full_name?: string; avatar_url?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this._currentUser.value;
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Atualizar na tabela pública
      const { error: publicError } = await this.supabaseService.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (publicError) {
        return { success: false, error: publicError.message };
      }

      // Atualizar também nos metadados do auth (opcional)
      const { error: authError } = await this.supabaseService.supabase.auth.updateUser({
        data: updates
      });

      if (authError) {
        console.warn('Aviso: Erro ao atualizar metadados do auth:', authError.message);
      }

      // Atualizar estado local
      this._currentUser.next({ ...user, ...updates });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  }
} 
} 