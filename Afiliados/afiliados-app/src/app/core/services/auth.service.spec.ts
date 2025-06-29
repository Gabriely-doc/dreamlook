import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUser: any;

  beforeEach(() => {
    mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };

    const supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [
      'signIn',
      'signUp',
      'signInWithProvider',
      'signOut'
    ], {
      currentUser$: new BehaviorSubject(null),
      session$: new BehaviorSubject(null),
      currentUser: null,
      isAuthenticated: false
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('🔴 Authentication State Management', () => {
    it('should expose isAuthenticated$ observable', () => {
      expect(service.isAuthenticated$).toBeDefined();
      expect(service.isAuthenticated$).toEqual(jasmine.any(Object));
    });

    it('should expose currentUser$ observable', () => {
      expect(service.currentUser$).toBeDefined();
      expect(service.currentUser$).toEqual(jasmine.any(Object));
    });

    it('should return current authentication status', () => {
      expect(service.isAuthenticated).toBeDefined();
      expect(typeof service.isAuthenticated).toBe('boolean');
    });

    it('should return current user', () => {
      expect(service.currentUser).toBeDefined();
    });
  });

  describe('🔴 Email/Password Authentication', () => {
    it('should sign in with email and password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockSupabaseService.signIn.and.returnValue(Promise.resolve({
        data: { user: mockUser, session: { access_token: 'token' } as any },
        error: null
      } as any));

      const result = await service.signInWithEmail(email, password);

      expect(mockSupabaseService.signIn).toHaveBeenCalledWith(email, password);
      expect(result.success).toBeTruthy();
      expect(result.user).toEqual(mockUser);
    });

    it('should handle sign in errors', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      
      mockSupabaseService.signIn.and.returnValue(Promise.resolve({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as any
      } as any));

      const result = await service.signInWithEmail(email, password);

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should sign up with email and password', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const metadata = { full_name: 'New User' };
      
      mockSupabaseService.signUp.and.returnValue(Promise.resolve({
        data: { user: mockUser, session: null },
        error: null
      } as any));

      const result = await service.signUpWithEmail(email, password, metadata);

      expect(mockSupabaseService.signUp).toHaveBeenCalledWith(email, password, metadata);
      expect(result.success).toBeTruthy();
    });
  });

  describe('🔴 OAuth Authentication', () => {
    it('should sign in with Google', async () => {
      mockSupabaseService.signInWithProvider.and.returnValue(Promise.resolve({
        data: { provider: 'google' as any, url: 'https://oauth-url.com' },
        error: null
      } as any));

      const result = await service.signInWithGoogle();

      expect(mockSupabaseService.signInWithProvider).toHaveBeenCalledWith('google');
      expect(result.success).toBeTruthy();
    });

    it('should handle OAuth errors', async () => {
      mockSupabaseService.signInWithProvider.and.returnValue(Promise.resolve({
        data: { provider: 'google' as any, url: null },
        error: { message: 'OAuth error' } as any
      } as any));

      const result = await service.signInWithGoogle();

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('OAuth error');
    });
  });

  describe('🔴 Session Management', () => {
    it('should sign out user', async () => {
      mockSupabaseService.signOut.and.returnValue(Promise.resolve({
        error: null
      } as any));

      const result = await service.signOut();

      expect(mockSupabaseService.signOut).toHaveBeenCalled();
      expect(result.success).toBeTruthy();
    });

    it('should handle sign out errors', async () => {
      mockSupabaseService.signOut.and.returnValue(Promise.resolve({
        error: { message: 'Sign out failed' } as any
      } as any));

      const result = await service.signOut();

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Sign out failed');
    });

    it('should navigate to login after sign out', async () => {
      mockSupabaseService.signOut.and.returnValue(Promise.resolve({
        error: null
      } as any));

      await service.signOut();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
    });
  });

  describe('🔴 User Role Management', () => {
    it('should check if user is admin', () => {
      const adminUser = { ...mockUser, user_metadata: { role: 'admin' } };
      spyOnProperty(service, 'currentUser', 'get').and.returnValue(adminUser);

      expect(service.isAdmin()).toBeTruthy();
    });

    it('should return false for non-admin user', () => {
      spyOnProperty(service, 'currentUser', 'get').and.returnValue(mockUser);

      expect(service.isAdmin()).toBeFalsy();
    });

    it('should return false when no user is logged in', () => {
      spyOnProperty(service, 'currentUser', 'get').and.returnValue(null);

      expect(service.isAdmin()).toBeFalsy();
    });
  });

  describe('🔴 Session Persistence', () => {
    it('should restore session on init', () => {
      spyOn(service as any, 'initializeAuthState');
      
      service.ngOnInit();
      
      expect((service as any).initializeAuthState).toHaveBeenCalled();
    });

    it('should handle session changes', () => {
      spyOn(service as any, 'handleAuthStateChange');
      
      // Simular mudança de sessão
      const newSession = { access_token: 'new-token', user: mockUser };
      (mockSupabaseService.session$ as BehaviorSubject<any>).next(newSession);
      
      expect((service as any).handleAuthStateChange).toHaveBeenCalled();
    });
  });

  describe('🔴 Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseService.signIn.and.returnValue(Promise.reject(new Error('Network error')));

      const result = await service.signInWithEmail('test@example.com', 'password');

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Network error');
    });

    it('should validate email format', async () => {
      const result = await service.signInWithEmail('invalid-email', 'password');

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('email');
    });

    it('should validate password strength', async () => {
      const result = await service.signUpWithEmail('test@example.com', '123');

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('password');
    });
  });
}); 