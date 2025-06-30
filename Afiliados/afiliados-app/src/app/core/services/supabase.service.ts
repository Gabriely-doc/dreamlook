import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private connectionStatusSubject = new BehaviorSubject<'connected' | 'disconnected' | 'checking'>('checking');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  public supabase: SupabaseClient;

  constructor() {
    // Verificar se as configurações do Supabase estão presentes
    if (!environment.supabase.url || !environment.supabase.anonKey) {
      console.warn('⚠️ Configurações do Supabase não encontradas. Verifique o environment.ts');
      console.warn('📖 Consulte docs/SUPABASE_SETUP.md para instruções de configuração');
    }

    // Limpar possíveis locks órfãos antes de inicializar
    this.clearAuthLocks();

    this.supabase = createClient(
      environment.supabase.url || 'https://placeholder.supabase.co',
      environment.supabase.anonKey || 'placeholder-anon-key',
      {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );

    // Monitorar mudanças de autenticação
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.sessionSubject.next(session);
      
      if (environment.debug.enableConsoleLog) {
        console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
      }
    });
  }

  // Getter para acessar o cliente Supabase diretamente
  get client(): SupabaseClient {
    return this.supabase;
  }

  // Observables para estado de autenticação
  get session$(): Observable<Session | null> {
    return this.sessionSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!this.sessionSubject.value;
  }

  // Testar conexão com o Supabase
  async testConnection(): Promise<boolean> {
    try {
      if (!environment.supabase.url || environment.supabase.url.includes('placeholder')) {
        console.log('❌ Configuração do Supabase pendente');
        console.log('📖 Consulte docs/SUPABASE_SETUP.md para configurar');
        return false;
      }

      // Testar conexão usando uma tabela que sabemos que existe (niches)
      const { data, error } = await this.supabase
        .from('niches')
        .select('id')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Supabase conectado com sucesso!');
      console.log('🌐 URL:', environment.supabase.url);
      console.log('📊 Tabelas do banco acessíveis');
      return true;
    } catch (error: any) {
      console.log('❌ Erro na conexão com Supabase:', error.message);
      
      if (error.message?.includes('Invalid API key')) {
        console.log('🔑 Verifique se a anon key está correta no environment.ts');
      } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.log('🗄️ Tabelas do banco não encontradas. Execute os scripts SQL primeiro.');
        console.log('📖 Consulte docs/SUPABASE_SETUP.md para instruções');
      }
      
      return false;
    }
  }

  // Método para verificar se o projeto está configurado
  isConfigured(): boolean {
    return !!(
      environment.supabase.url && 
      environment.supabase.anonKey &&
      !environment.supabase.url.includes('placeholder') &&
      !environment.supabase.anonKey.includes('placeholder')
    );
  }

  // Métodos de autenticação básicos
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signInWithProvider(provider: 'google' | 'github' | 'discord') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  // Método para obter informações do projeto
  getProjectInfo() {
    return {
      url: environment.supabase.url,
      isConfigured: this.isConfigured(),
      features: environment.features,
      currentNiche: environment.niches.current,
      version: environment.version
    };
  }

  // Método para buscar produtos com filtro opcional por status
  getProducts(status?: string): Observable<any[]> {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        niches!inner(name, slug)
      `)
      .eq('niches.slug', environment.niches.current)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    } else {
      // Se não especificar status, buscar apenas aprovados (para feed público)
      query = query.eq('status', 'approved');
    }

    return from(query).pipe(
      map((response: any) => {
        if (response.error) {
          throw response.error;
        }
        return response.data || [];
      }),
      catchError((error) => {
        console.error('Erro ao buscar produtos:', error);
        return of([]);
      })
    );
  }

  // Método para atualizar status de um produto (moderação)
  async updateProductStatus(productId: string, status: 'approved' | 'rejected' | 'pending'): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      return { data: null, error };
    }
  }

  // Métodos para produtos
  getProductsByNiche(niche: string, page: number = 0, limit: number = 10): Observable<any[]> {
    return from(this.fetchProductsByNiche(niche, page, limit));
  }

  loadMoreProducts(page: number, limit: number = 10): Observable<any[]> {
    return from(this.fetchProducts(page, limit));
  }

  // Método para votar em produtos
  async voteProduct(userId: string, productId: string, isPositive: boolean): Promise<any> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabase.rpc('vote_product', {
        p_user_id: userId,
        p_product_id: productId,
        p_is_positive: isPositive
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error voting on product:', error);
      throw error;
    }
  }

  // Método para buscar votos do usuário
  async getUserVotes(userId: string, productIds: string[]): Promise<any[]> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabase
        .from('user_votes')
        .select('product_id, is_positive')
        .eq('user_id', userId)
        .in('product_id', productIds);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return [];
    }
  }

  private async fetchProducts(page: number, limit: number): Promise<any[]> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          title,
          current_price,
          image_url,
          affiliate_url,
          heat_score,
          niches!inner(slug),
          created_at
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('heat_score', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        throw error;
      }

      // Transformar dados para o formato esperado pelo componente
      return (data || []).map((product: any) => ({
        id: product.id,
        name: product.title,
        price: product.current_price,
        image_url: product.image_url,
        affiliate_link: product.affiliate_url,
        vote_score: product.heat_score || 0,
        niche: product.niches?.slug || 'unknown',
        created_at: product.created_at
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  private async fetchProductsByNiche(niche: string, page: number, limit: number): Promise<any[]> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          title,
          current_price,
          image_url,
          affiliate_url,
          heat_score,
          niches!inner(slug),
          created_at
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .eq('niches.slug', niche)
        .order('heat_score', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        throw error;
      }

      // Transformar dados para o formato esperado pelo componente
      return (data || []).map((product: any) => ({
        id: product.id,
        name: product.title,
        price: product.current_price,
        image_url: product.image_url,
        affiliate_link: product.affiliate_url,
        vote_score: product.heat_score || 0,
        niche: product.niches?.slug || niche,
        created_at: product.created_at
      }));
    } catch (error) {
      console.error('Error fetching products by niche:', error);
      throw error;
    }
  }

  // Limpar locks órfãos do localStorage que podem causar problemas
  private clearAuthLocks() {
    try {
      // Limpar possíveis locks órfãos do Supabase
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('lock:sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key);
          console.log('🧹 Removido lock órfão:', key);
        }
      });
    } catch (error) {
      console.warn('⚠️ Erro ao limpar locks:', error);
    }
  }
} 