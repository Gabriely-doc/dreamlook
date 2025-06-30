import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from './core/services/supabase.service';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Deals Hub - Afiliados';
  showInstallBanner = false;
  supabaseStatus = 'checking'; // 'checking' | 'connected' | 'error' | 'not-configured'
  isAuthenticated = false;
  currentUser: any = null;
  private deferredPrompt: any;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Verificar configuração e conexão do Supabase
    await this.checkSupabaseConnection();

    // Setup authentication state
    this.setupAuthState();

    // PWA Install Banner Logic
    this.setupPWAInstallPrompt();

    // Log informações do projeto
    if (environment.debug.enableConsoleLog) {
      console.log('🚀 Deals Hub - Afiliados iniciado');
      console.log('📊 Informações do projeto:', this.supabaseService.getProjectInfo());
    }
  }

  private setupPWAInstallPrompt() {
    // Escutar evento de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 beforeinstallprompt event triggered');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner = true;
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.showInstallBanner = false;
      console.log('✅ PWA instalado com sucesso!');
    });

    // Para desenvolvimento: mostrar banner após 3 segundos se não for PWA
    setTimeout(() => {
      if (!this.isPWAInstalled() && !this.showInstallBanner) {
        console.log('🔧 Modo desenvolvimento: simulando prompt de instalação');
        this.showInstallBanner = true;
      }
    }, 3000);
  }

  private isPWAInstalled(): boolean {
    // Verificar se já está instalado como PWA
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  private async checkSupabaseConnection() {
    try {
      if (!this.supabaseService.isConfigured()) {
        this.supabaseStatus = 'not-configured';
        console.log('⚠️ Supabase não configurado. Configure em environment.ts');
        return;
      }

      const isConnected = await this.supabaseService.testConnection();
      this.supabaseStatus = isConnected ? 'connected' : 'error';
    } catch (error) {
      this.supabaseStatus = 'error';
      console.error('❌ Erro ao verificar conexão Supabase:', error);
    }
  }

  async installPWA() {
    if (this.deferredPrompt) {
      // Instalação real em produção
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar o PWA');
      } else {
        console.log('❌ Usuário recusou instalar o PWA');
      }
      
      this.deferredPrompt = null;
      this.showInstallBanner = false;
    } else {
      // Modo desenvolvimento ou fallback
      console.log('🔧 Modo desenvolvimento: Para testar a instalação real:');
      console.log('1. Execute: ng build --configuration=production');
      console.log('2. Sirva os arquivos com um servidor HTTPS');
      console.log('3. Ou use: npx http-server dist/afiliados-app -p 8080 --ssl');
      
      // Mostrar instruções no navegador
      alert('Para testar a instalação PWA:\n\n1. Build de produção: ng build --prod\n2. Servir com HTTPS\n3. Ou testar no Chrome DevTools > Application > Manifest');
      
      this.showInstallBanner = false;
    }
  }

  dismissBanner() {
    this.showInstallBanner = false;
  }

  getSupabaseStatusText(): string {
    switch (this.supabaseStatus) {
      case 'checking':
        return 'Verificando conexão...';
      case 'connected':
        return 'Conectado ao Supabase ✅';
      case 'error':
        return 'Erro na conexão ❌';
      case 'not-configured':
        return 'Supabase não configurado ⚠️';
      default:
        return 'Status desconhecido';
    }
  }

  getSupabaseStatusClass(): string {
    switch (this.supabaseStatus) {
      case 'connected':
        return 'status-success';
      case 'error':
        return 'status-error';
      case 'not-configured':
        return 'status-warning';
      default:
        return 'status-info';
    }
  }

  private setupAuthState(): void {
    // Monitorar estado de autenticação
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }

  // Método temporário para debug
  debugUserInfo(): void {
    console.log('🐛 === DEBUG USER INFO ===');
    console.log('isAuthenticated:', this.isAuthenticated);
    console.log('currentUser:', this.currentUser);
    console.log('isAdmin():', this.authService.isAdmin());
    this.authService.debugCurrentUser();
    console.log('🐛 === END DEBUG ===');
  }
}
