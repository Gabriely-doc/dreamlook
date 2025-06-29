import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  ngOnInit(): void {
    this.initializeAuthState();
  }

  // Getters para estado atual
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Autenticação com email/senha
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Validação básica de email
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      const { data, error } = await this.supabaseService.signIn(email, password);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (data?.user) {
        this.updateAuthState(data.user, data.session);
        return {
          success: true,
          user: data.user
        };
      }

      return {
        success: false,
        error: 'Authentication failed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Registro com email/senha
  async signUpWithEmail(email: string, password: string, metadata?: any): Promise<AuthResult> {
    try {
      // Validação de email
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      // Validação de senha
      if (!this.isValidPassword(password)) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
      }

      const { data, error } = await this.supabaseService.signUp(email, password, metadata);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        user: data?.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Autenticação com Google
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabaseService.signInWithProvider('google');

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OAuth error occurred'
      };
    }
  }

  // Logout
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabaseService.signOut();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      this.updateAuthState(null, null);
      this.router.navigate(['/auth']);

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign out failed'
      };
    }
  }

  // Verificar se usuário é admin
  isAdmin(): boolean {
    const user = this.currentUser;
    if (!user || !user.user_metadata) {
      return false;
    }
    return user.user_metadata['role'] === 'admin';
  }

  // Métodos privados
  private initializeAuthState(): void {
    // Monitorar mudanças de sessão
    this.supabaseService.session$.subscribe(session => {
      this.handleAuthStateChange(session);
    });

    // Monitorar mudanças de usuário
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(!!user);
    });
  }

  private handleAuthStateChange(session: Session | null): void {
    if (session?.user) {
      this.updateAuthState(session.user, session);
    } else {
      this.updateAuthState(null, null);
    }
  }

  private updateAuthState(user: User | null, session: Session | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return !!(password && password.length >= 6);
  }
} 