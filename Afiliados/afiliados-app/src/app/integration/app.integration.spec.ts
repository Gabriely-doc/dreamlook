import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AppComponent } from '../app.component';
import { FeedComponent } from '../features/feed/feed.component';
import { LoginComponent } from '../features/auth/login.component';
import { AdminDashboardComponent } from '../features/admin/admin-dashboard.component';
import { SupabaseService } from '../core/services/supabase.service';

// Mock components para teste de navegação
@Component({ template: '' })
class MockFeedComponent { }

@Component({ template: '' })
class MockLoginComponent { }

@Component({ template: '' })
class MockAdminComponent { }

describe('App Integration Tests', () => {
  let router: Router;
  let location: Location;
  let fixture: any;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(async () => {
    const supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [
      'isConfigured',
      'testConnection',
      'getProjectInfo'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        FeedComponent,
        LoginComponent,
        AdminDashboardComponent,
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: '/feed', pathMatch: 'full' },
          { path: 'feed', component: MockFeedComponent },
          { path: 'auth', component: MockLoginComponent },
          { path: 'admin', component: MockAdminComponent }
        ])
      ],
      providers: [
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(AppComponent);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;

    // Setup default mocks
    mockSupabaseService.isConfigured.and.returnValue(true);
    mockSupabaseService.testConnection.and.returnValue(Promise.resolve(true));
    mockSupabaseService.getProjectInfo.and.returnValue({
      url: 'https://test.supabase.co',
      isConfigured: true,
      features: {
        enablePWA: true,
        enableAnalytics: false,
        enablePushNotifications: false,
        enableRealtime: true,
        enableAuth: true
      },
      currentNiche: 'beleza',
      version: '1.0.0'
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate to feed by default', async () => {
      await router.navigate(['']);
      expect(location.path()).toBe('/feed');
    });

    it('should navigate to auth page', async () => {
      await router.navigate(['/auth']);
      expect(location.path()).toBe('/auth');
    });

    it('should navigate to admin page', async () => {
      await router.navigate(['/admin']);
      expect(location.path()).toBe('/admin');
    });

    it('should handle navigation between all pages', async () => {
      // Start at feed
      await router.navigate(['/feed']);
      expect(location.path()).toBe('/feed');

      // Go to auth
      await router.navigate(['/auth']);
      expect(location.path()).toBe('/auth');

      // Go to admin
      await router.navigate(['/admin']);
      expect(location.path()).toBe('/admin');

      // Back to feed
      await router.navigate(['/feed']);
      expect(location.path()).toBe('/feed');
    });
  });

  describe('App Initialization Flow', () => {
    it('should initialize app with Supabase connection check', async () => {
      const component = fixture.componentInstance;
      
      await component.ngOnInit();
      
      expect(mockSupabaseService.isConfigured).toHaveBeenCalled();
      expect(mockSupabaseService.testConnection).toHaveBeenCalled();
      expect(component.supabaseStatus).toBe('connected');
    });

    it('should handle app initialization with Supabase error', async () => {
      mockSupabaseService.testConnection.and.returnValue(Promise.resolve(false));
      const component = fixture.componentInstance;
      
      await component.ngOnInit();
      
      expect(component.supabaseStatus).toBe('error');
    });

    it('should initialize PWA functionality', async () => {
      const component = fixture.componentInstance;
      spyOn(component as any, 'setupPWAInstallPrompt');
      
      await component.ngOnInit();
      
      expect((component as any).setupPWAInstallPrompt).toHaveBeenCalled();
    });
  });

  describe('PWA Installation Flow', () => {
    it('should complete PWA installation flow', async () => {
      const component = fixture.componentInstance;
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      // Simulate beforeinstallprompt event
      (component as any).deferredPrompt = mockEvent;
      component.showInstallBanner = true;

      // Install PWA
      await component.installPWA();

      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(component.showInstallBanner).toBeFalse();
      expect((component as any).deferredPrompt).toBeNull();
    });

    it('should handle PWA installation cancellation', async () => {
      const component = fixture.componentInstance;
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'dismissed' })
      };

      (component as any).deferredPrompt = mockEvent;
      component.showInstallBanner = true;

      await component.installPWA();

      expect(component.showInstallBanner).toBeFalse();
    });
  });

  describe('Component Integration', () => {
    it('should load feed component with vote handlers', async () => {
      await router.navigate(['/feed']);
      
      const feedComponent = TestBed.createComponent(FeedComponent);
      feedComponent.detectChanges();
      
      expect(feedComponent.componentInstance.onUpvote).toBeDefined();
      expect(feedComponent.componentInstance.onDownvote).toBeDefined();
    });

    it('should load login component with auth options', async () => {
      await router.navigate(['/auth']);
      
      const loginComponent = TestBed.createComponent(LoginComponent);
      loginComponent.detectChanges();
      
      // Component should be created successfully
      expect(loginComponent.componentInstance).toBeTruthy();
    });

    it('should load admin dashboard with metrics', async () => {
      await router.navigate(['/admin']);
      
      const adminComponent = TestBed.createComponent(AdminDashboardComponent);
      adminComponent.detectChanges();
      
      // Component should be created successfully
      expect(adminComponent.componentInstance).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle Supabase service errors gracefully', async () => {
      mockSupabaseService.testConnection.and.returnValue(Promise.reject(new Error('Network error')));
      const component = fixture.componentInstance;
      
      // Should not throw
      await expectAsync(component.ngOnInit()).not.toBeRejected();
      expect(component.supabaseStatus).toBe('error');
    });

    it('should handle navigation errors', async () => {
      // Navigate to non-existent route
      await expectAsync(router.navigate(['/non-existent'])).not.toBeRejected();
    });
  });

  describe('State Management Integration', () => {
    it('should maintain Supabase status across navigation', async () => {
      const component = fixture.componentInstance;
      await component.ngOnInit();
      
      expect(component.supabaseStatus).toBe('connected');
      
      // Navigate to different pages
      await router.navigate(['/auth']);
      expect(component.supabaseStatus).toBe('connected');
      
      await router.navigate(['/admin']);
      expect(component.supabaseStatus).toBe('connected');
    });

    it('should maintain PWA state across navigation', async () => {
      const component = fixture.componentInstance;
      component.showInstallBanner = true;
      
      // Navigate to different pages
      await router.navigate(['/auth']);
      expect(component.showInstallBanner).toBeTrue();
      
      await router.navigate(['/admin']);
      expect(component.showInstallBanner).toBeTrue();
    });
  });

  describe('Performance Integration', () => {
    it('should initialize components quickly', async () => {
      const startTime = performance.now();
      
      const component = fixture.componentInstance;
      await component.ngOnInit();
      fixture.detectChanges();
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Should initialize in less than 100ms
      expect(initTime).toBeLessThan(100);
    });

    it('should handle concurrent navigation', async () => {
      const promises = [
        router.navigate(['/feed']),
        router.navigate(['/auth']),
        router.navigate(['/admin'])
      ];
      
      // Should not throw errors
      await expectAsync(Promise.all(promises)).not.toBeRejected();
    });
  });
}); 