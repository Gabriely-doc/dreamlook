import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';

// Mock do createClient do Supabase
const mockSupabaseClient = {
  auth: {
    onAuthStateChange: jasmine.createSpy('onAuthStateChange').and.returnValue(() => {}),
    signUp: jasmine.createSpy('signUp').and.returnValue(Promise.resolve({ data: null, error: null })),
    signInWithPassword: jasmine.createSpy('signInWithPassword').and.returnValue(Promise.resolve({ data: null, error: null })),
    signInWithOAuth: jasmine.createSpy('signInWithOAuth').and.returnValue(Promise.resolve({ data: null, error: null })),
    signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve({ error: null }))
  },
  from: jasmine.createSpy('from').and.returnValue({
    select: jasmine.createSpy('select').and.returnValue({
      limit: jasmine.createSpy('limit').and.returnValue(Promise.resolve({ data: [], error: null }))
    })
  })
};

// Mock do createClient será feito no beforeEach

describe('SupabaseService', () => {
  let service: SupabaseService;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Mock localStorage
    originalLocalStorage = window.localStorage;
    const mockLocalStorage = {
      getItem: jasmine.createSpy('getItem'),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem'),
      clear: jasmine.createSpy('clear'),
      key: jasmine.createSpy('key'),
      length: 0
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isConfigured', () => {
    it('should return false when Supabase is not configured', () => {
      spyOnProperty(environment.supabase, 'url', 'get').and.returnValue('https://placeholder.supabase.co');
      spyOnProperty(environment.supabase, 'anonKey', 'get').and.returnValue('placeholder-anon-key');
      
      expect(service.isConfigured()).toBeFalse();
    });

    it('should return true when Supabase is properly configured', () => {
      spyOnProperty(environment.supabase, 'url', 'get').and.returnValue('https://real-project.supabase.co');
      spyOnProperty(environment.supabase, 'anonKey', 'get').and.returnValue('real-anon-key');
      
      expect(service.isConfigured()).toBeTrue();
    });
  });

  describe('testConnection', () => {
    it('should return false when not configured', async () => {
      spyOn(service, 'isConfigured').and.returnValue(false);
      
      const result = await service.testConnection();
      
      expect(result).toBeFalse();
    });

    it('should return true when connection is successful', async () => {
      spyOn(service, 'isConfigured').and.returnValue(true);
      mockSupabaseClient.from.and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          limit: jasmine.createSpy('limit').and.returnValue(Promise.resolve({ data: [], error: null }))
        })
      });
      
      const result = await service.testConnection();
      
      expect(result).toBeTrue();
    });

    it('should return false when connection fails', async () => {
      spyOn(service, 'isConfigured').and.returnValue(true);
      mockSupabaseClient.from.and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          limit: jasmine.createSpy('limit').and.returnValue(Promise.resolve({ 
            data: null, 
            error: { message: 'Connection failed' } 
          }))
        })
      });
      
      const result = await service.testConnection();
      
      expect(result).toBeFalse();
    });
  });

  describe('Authentication Methods', () => {
    it('should call signUp with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const metadata = { name: 'Test User' };
      
      await service.signUp(email, password, metadata);
      
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: { data: metadata }
      });
    });

    it('should call signIn with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      await service.signIn(email, password);
      
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password
      });
    });

    it('should call signInWithProvider with correct parameters', async () => {
      const provider = 'google';
      
      await service.signInWithProvider(provider);
      
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    });

    it('should call signOut', async () => {
      await service.signOut();
      
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getProjectInfo', () => {
    it('should return project information', () => {
      const projectInfo = service.getProjectInfo();
      
      expect(projectInfo).toEqual({
        url: environment.supabase.url,
        isConfigured: service.isConfigured(),
        features: environment.features,
        currentNiche: environment.niches.current,
        version: environment.version
      });
    });
  });

  describe('clearAuthLocks', () => {
    it('should remove auth locks from localStorage', () => {
      const mockKeys = ['lock:sb-test-auth-token', 'other-key', 'lock:sb-another-auth-token'];
      spyOn(Object, 'keys').and.returnValue(mockKeys);
      
      // Trigger clearAuthLocks through constructor
      TestBed.inject(SupabaseService);
      
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('lock:sb-test-auth-token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('lock:sb-another-auth-token');
      expect(window.localStorage.removeItem).not.toHaveBeenCalledWith('other-key');
    });
  });
}); 