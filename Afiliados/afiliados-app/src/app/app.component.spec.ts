import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SupabaseService } from './core/services/supabase.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { environment } from '../environments/environment';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(async () => {
    const supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [
      'isConfigured',
      'testConnection',
      'getProjectInfo'
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toEqual('Deals Hub - Afiliados');
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display app logo', () => {
      const logoElement = fixture.debugElement.query(By.css('.nav-logo h2'));
      expect(logoElement.nativeElement.textContent).toContain('🛍️ Deals Hub');
    });

    it('should have navigation links', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-links a'));
      expect(navLinks.length).toBe(3);
      
      expect(navLinks[0].nativeElement.textContent).toContain('Feed');
      expect(navLinks[1].nativeElement.textContent).toContain('Login');
      expect(navLinks[2].nativeElement.textContent).toContain('Admin');
    });

    it('should have router outlets', () => {
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(routerOutlet).toBeTruthy();
    });
  });

  describe('Supabase Status', () => {
    beforeEach(() => {
      mockSupabaseService.isConfigured.and.returnValue(true);
      mockSupabaseService.testConnection.and.returnValue(Promise.resolve(true));
      mockSupabaseService.getProjectInfo.and.returnValue({
        url: 'https://test.supabase.co',
        isConfigured: true,
        features: environment.features,
        currentNiche: environment.niches.current,
        version: environment.version
      });
    });

    it('should display Supabase status', () => {
      fixture.detectChanges();
      const statusElement = fixture.debugElement.query(By.css('.supabase-status'));
      expect(statusElement).toBeTruthy();
    });

    it('should show checking status initially', () => {
      expect(component.getSupabaseStatusText()).toBe('Verificando conexão...');
      expect(component.getSupabaseStatusClass()).toBe('status-info');
    });

    it('should show connected status when configured', async () => {
      await component.ngOnInit();
      component.supabaseStatus = 'connected';
      
      expect(component.getSupabaseStatusText()).toBe('Conectado ao Supabase ✅');
      expect(component.getSupabaseStatusClass()).toBe('status-success');
    });

    it('should show error status when connection fails', async () => {
      mockSupabaseService.testConnection.and.returnValue(Promise.resolve(false));
      await component.ngOnInit();
      
      expect(component.supabaseStatus).toBe('error');
      expect(component.getSupabaseStatusText()).toBe('Erro na conexão ❌');
      expect(component.getSupabaseStatusClass()).toBe('status-error');
    });

    it('should show not configured status', async () => {
      mockSupabaseService.isConfigured.and.returnValue(false);
      await component.ngOnInit();
      
      expect(component.supabaseStatus).toBe('not-configured');
      expect(component.getSupabaseStatusText()).toBe('Supabase não configurado ⚠️');
      expect(component.getSupabaseStatusClass()).toBe('status-warning');
    });
  });

  describe('PWA Functionality', () => {
    let mockBeforeInstallPromptEvent: any;

    beforeEach(() => {
      mockBeforeInstallPromptEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
    });

    it('should initialize with showInstallBanner as false', () => {
      expect(component.showInstallBanner).toBeFalse();
    });

    it('should handle beforeinstallprompt event', () => {
      spyOn(window, 'addEventListener').and.callFake((event: any, handler: any) => {
        if (event === 'beforeinstallprompt') {
          handler(mockBeforeInstallPromptEvent);
        }
      });

      component.ngOnInit();

      expect(mockBeforeInstallPromptEvent.preventDefault).toHaveBeenCalled();
      expect(component.showInstallBanner).toBeTrue();
      expect((component as any).deferredPrompt).toBe(mockBeforeInstallPromptEvent);
    });

    it('should install PWA when prompt is available', async () => {
      (component as any).deferredPrompt = mockBeforeInstallPromptEvent;
      component.showInstallBanner = true;

      await component.installPWA();

      expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled();
      expect(component.showInstallBanner).toBeFalse();
      expect((component as any).deferredPrompt).toBeNull();
    });

    it('should show instructions when no prompt available', async () => {
      spyOn(window, 'alert');
      (component as any).deferredPrompt = null;

      await component.installPWA();

      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Para testar a instalação PWA'));
      expect(component.showInstallBanner).toBeFalse();
    });

    it('should dismiss banner', () => {
      component.showInstallBanner = true;
      component.dismissBanner();
      expect(component.showInstallBanner).toBeFalse();
    });
  });

  describe('PWA Banner Display', () => {
    it('should show PWA banner when showInstallBanner is true', () => {
      component.showInstallBanner = true;
      fixture.detectChanges();

      const pwaBanner = fixture.debugElement.query(By.css('.pwa-banner'));
      expect(pwaBanner).toBeTruthy();
    });

    it('should hide PWA banner when showInstallBanner is false', () => {
      component.showInstallBanner = false;
      fixture.detectChanges();

      const pwaBanner = fixture.debugElement.query(By.css('.pwa-banner'));
      expect(pwaBanner).toBeFalsy();
    });

    it('should have install and dismiss buttons in banner', () => {
      component.showInstallBanner = true;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.pwa-banner button'));
      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent).toContain('Instalar');
      expect(buttons[1].nativeElement.textContent).toContain('Dispensar');
    });
  });

  describe('Component Initialization', () => {
    it('should call checkSupabaseConnection on init', async () => {
      spyOn(component as any, 'checkSupabaseConnection').and.returnValue(Promise.resolve());
      
      await component.ngOnInit();
      
      expect((component as any).checkSupabaseConnection).toHaveBeenCalled();
    });

    it('should setup PWA install prompt on init', async () => {
      spyOn(component as any, 'setupPWAInstallPrompt');
      
      await component.ngOnInit();
      
      expect((component as any).setupPWAInstallPrompt).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase connection errors gracefully', async () => {
      mockSupabaseService.testConnection.and.returnValue(Promise.reject(new Error('Connection failed')));
      
      await component.ngOnInit();
      
      expect(component.supabaseStatus).toBe('error');
    });

    it('should handle PWA installation errors', async () => {
      const errorEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        prompt: jasmine.createSpy('prompt').and.returnValue(Promise.reject(new Error('Install failed'))),
        userChoice: Promise.resolve({ outcome: 'dismissed' })
      };
      
      (component as any).deferredPrompt = errorEvent;
      
      // Should not throw error
      await expectAsync(component.installPWA()).not.toBeRejected();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper navigation structure', () => {
      const nav = fixture.debugElement.query(By.css('nav'));
      expect(nav).toBeTruthy();
      expect(nav.nativeElement.classList.contains('main-nav')).toBeTruthy();
    });

    it('should have semantic main content area', () => {
      const main = fixture.debugElement.query(By.css('main'));
      expect(main).toBeTruthy();
      expect(main.nativeElement.classList.contains('main-content')).toBeTruthy();
    });

    it('should have proper heading structure', () => {
      const heading = fixture.debugElement.query(By.css('h2'));
      expect(heading).toBeTruthy();
    });
  });
});
