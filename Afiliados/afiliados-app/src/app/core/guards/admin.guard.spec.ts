import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin'], {
      isAuthenticated: false,
      currentUser: null
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock route objects
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/admin' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('🔴 Authentication Check', () => {
    it('should deny access when user is not authenticated', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(false);
      
      const result = guard.canActivate(mockRoute, mockState);
      
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should check authentication status', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      guard.canActivate(mockRoute, mockState);
      
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('🔴 Admin Role Verification', () => {
    beforeEach(() => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
    });

    it('should allow access when user is admin', () => {
      mockAuthService.isAdmin.and.returnValue(true);
      
      const result = guard.canActivate(mockRoute, mockState);
      
      expect(result).toBeTruthy();
      expect(mockAuthService.isAdmin).toHaveBeenCalled();
    });

    it('should deny access when user is not admin', () => {
      mockAuthService.isAdmin.and.returnValue(false);
      
      const result = guard.canActivate(mockRoute, mockState);
      
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call isAdmin method to verify role', () => {
      mockAuthService.isAdmin.and.returnValue(true);
      
      guard.canActivate(mockRoute, mockState);
      
      expect(mockAuthService.isAdmin).toHaveBeenCalled();
    });
  });

  describe('🔴 Navigation Behavior', () => {
    it('should redirect to /auth when not authenticated', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(false);
      
      guard.canActivate(mockRoute, mockState);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should redirect to home when authenticated but not admin', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(false);
      
      guard.canActivate(mockRoute, mockState);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not redirect when user is admin', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      guard.canActivate(mockRoute, mockState);
      
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('🔴 Edge Cases', () => {
    it('should handle null user gracefully', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(false);
      spyOnProperty(mockAuthService, 'currentUser', 'get').and.returnValue(null);
      
      const result = guard.canActivate(mockRoute, mockState);
      
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should handle isAdmin throwing error', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.throwError('Auth error');
      
      const result = guard.canActivate(mockRoute, mockState);
      
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should work with different admin route paths', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      const adminDashboardState = { url: '/admin/dashboard' } as RouterStateSnapshot;
      const result = guard.canActivate(mockRoute, adminDashboardState);
      
      expect(result).toBeTruthy();
    });
  });

  describe('🔴 CanActivateChild Implementation', () => {
    it('should implement canActivateChild', () => {
      expect(guard.canActivateChild).toBeDefined();
      expect(typeof guard.canActivateChild).toBe('function');
    });

    it('should use same logic for canActivateChild', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      const result = guard.canActivateChild(mockRoute, mockState);
      
      expect(result).toBeTruthy();
      expect(mockAuthService.isAdmin).toHaveBeenCalled();
    });

    it('should deny child routes for non-admin users', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(false);
      
      const result = guard.canActivateChild(mockRoute, mockState);
      
      expect(result).toBeFalsy();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('🔴 Security Validation', () => {
    it('should always verify admin role for each route access', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      mockAuthService.isAdmin.and.returnValue(true);
      
      // Primeira chamada
      guard.canActivate(mockRoute, mockState);
      expect(mockAuthService.isAdmin).toHaveBeenCalledTimes(1);
      
      // Segunda chamada - deve verificar novamente
      guard.canActivate(mockRoute, mockState);
      expect(mockAuthService.isAdmin).toHaveBeenCalledTimes(2);
    });

    it('should not cache admin status', () => {
      spyOnProperty(mockAuthService, 'isAuthenticated', 'get').and.returnValue(true);
      
      // Primeira chamada - usuário é admin
      mockAuthService.isAdmin.and.returnValue(true);
      let result1 = guard.canActivate(mockRoute, mockState);
      expect(result1).toBeTruthy();
      
      // Segunda chamada - usuário não é mais admin
      mockAuthService.isAdmin.and.returnValue(false);
      let result2 = guard.canActivate(mockRoute, mockState);
      expect(result2).toBeFalsy();
    });
  });
}); 