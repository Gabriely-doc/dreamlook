import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

// Mock components para teste
@Component({
  template: '<h1>Home</h1>'
})
class MockHomeComponent {}

@Component({
  template: '<h1>Login</h1>'
})
class MockAuthComponent {}

@Component({
  template: '<h1>Admin Dashboard</h1>'
})
class MockAdminComponent {}

describe('AdminGuard Integration', () => {
  let router: Router;
  let location: Location;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin'], {
      isAuthenticated: false,
      currentUser: null
    });

    await TestBed.configureTestingModule({
      declarations: [MockHomeComponent, MockAuthComponent, MockAdminComponent],
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    // Configurar rotas de teste
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Configurar rotas de teste
    router.resetConfig([
      { path: '', component: MockHomeComponent },
      { path: 'auth', component: MockAuthComponent },
      { 
        path: 'admin', 
        component: MockAdminComponent,
        canActivate: [AdminGuard],
        canActivateChild: [AdminGuard]
      }
    ]);
  });

  describe('🔵 Route Protection Integration', () => {
    it('should redirect unauthenticated users to /auth', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(false);
      
      await router.navigate(['/admin']);
      
      expect(location.path()).toBe('/auth');
    });

    it('should redirect authenticated non-admin users to home', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(false);
      
      await router.navigate(['/admin']);
      
      expect(location.path()).toBe('/');
    });

    it('should allow admin users to access admin routes', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      await router.navigate(['/admin']);
      
      expect(location.path()).toBe('/admin');
    });
  });

  describe('🔵 Child Route Protection', () => {
    beforeEach(() => {
      // Adicionar rota filha para teste
      router.resetConfig([
        { path: '', component: MockHomeComponent },
        { path: 'auth', component: MockAuthComponent },
        { 
          path: 'admin', 
          component: MockAdminComponent,
          canActivate: [AdminGuard],
          canActivateChild: [AdminGuard],
          children: [
            { path: 'dashboard', component: MockAdminComponent },
            { path: 'users', component: MockAdminComponent }
          ]
        }
      ]);
    });

    it('should protect child routes from non-admin users', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(false);
      
      await router.navigate(['/admin/dashboard']);
      
      expect(location.path()).toBe('/');
    });

    it('should allow admin users to access child routes', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      await router.navigate(['/admin/dashboard']);
      
      expect(location.path()).toBe('/admin/dashboard');
    });
  });

  describe('🔵 Security Edge Cases', () => {
    it('should handle auth service errors by redirecting to login', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.throwError('Auth service error');
      
      await router.navigate(['/admin']);
      
      expect(location.path()).toBe('/auth');
    });

    it('should re-check admin status on each navigation', async () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      
      // Primeira navegação - usuário é admin
      mockAuthService.isAdmin.and.returnValue(true);
      await router.navigate(['/admin']);
      expect(location.path()).toBe('/admin');
      
      // Segunda navegação - usuário não é mais admin
      mockAuthService.isAdmin.and.returnValue(false);
      await router.navigate(['/']);
      await router.navigate(['/admin']);
      expect(location.path()).toBe('/');
    });
  });
}); 