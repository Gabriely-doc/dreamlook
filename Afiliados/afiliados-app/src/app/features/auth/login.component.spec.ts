import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'signInWithEmail',
      'signUpWithEmail', 
      'signInWithGoogle'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const titleElement = fixture.debugElement.query(By.css('.login-card h2'));
    expect(titleElement.nativeElement.textContent).toContain('🔐 Login');
  });

  it('should display the correct subtitle', () => {
    const subtitleElement = fixture.debugElement.query(By.css('.login-card p'));
    expect(subtitleElement.nativeElement.textContent).toContain('Entre para acessar sua conta');
  });

  describe('🔵 OAuth Authentication', () => {
    it('should have Google login button', () => {
      const googleBtn = fixture.debugElement.query(By.css('.btn-google'));
      expect(googleBtn).toBeTruthy();
      expect(googleBtn.nativeElement.textContent).toContain('Entrar com Google');
    });

    it('should call signInWithGoogle when Google button is clicked', async () => {
      mockAuthService.signInWithGoogle.and.returnValue(Promise.resolve({ success: true }));
      
      const googleBtn = fixture.debugElement.query(By.css('.btn-google'));
      googleBtn.nativeElement.click();
      
      expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
    });

    it('should show success message on Google login success', async () => {
      mockAuthService.signInWithGoogle.and.returnValue(Promise.resolve({ success: true }));
      
      await component.signInWithGoogle();
      fixture.detectChanges();
      
      expect(component.successMessage).toContain('Redirecionando para Google');
    });

    it('should show error message on Google login failure', async () => {
      mockAuthService.signInWithGoogle.and.returnValue(Promise.resolve({ 
        success: false, 
        error: 'OAuth error' 
      }));
      
      await component.signInWithGoogle();
      fixture.detectChanges();
      
      expect(component.errorMessage).toContain('OAuth error');
    });
  });

  describe('🔵 Email Form Toggle', () => {
    it('should have Email login button', () => {
      const emailBtn = fixture.debugElement.query(By.css('.btn-email'));
      expect(emailBtn).toBeTruthy();
      expect(emailBtn.nativeElement.textContent).toContain('Entrar com Email');
    });

    it('should show email form when email button is clicked', () => {
      const emailBtn = fixture.debugElement.query(By.css('.btn-email'));
      emailBtn.nativeElement.click();
      fixture.detectChanges();
      
      expect(component.showEmailForm).toBeTruthy();
      
      const emailForm = fixture.debugElement.query(By.css('.email-form'));
      expect(emailForm).toBeTruthy();
    });

    it('should hide email form when back button is clicked', () => {
      component.showEmailForm = true;
      fixture.detectChanges();
      
      const backBtn = fixture.debugElement.query(By.css('.btn-secondary'));
      backBtn.nativeElement.click();
      fixture.detectChanges();
      
      expect(component.showEmailForm).toBeFalsy();
    });
  });

  describe('🔵 Email/Password Authentication', () => {
    beforeEach(() => {
      component.showEmailForm = true;
      fixture.detectChanges();
    });

    it('should display email and password inputs', () => {
      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
      
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      const submitBtn = fixture.debugElement.query(By.css('.btn-primary'));
      expect(submitBtn.nativeElement.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      fixture.detectChanges();
      
      const submitBtn = fixture.debugElement.query(By.css('.btn-primary'));
      expect(submitBtn.nativeElement.disabled).toBeFalsy();
    });

    it('should call signInWithEmail on form submit', async () => {
      mockAuthService.signInWithEmail.and.returnValue(Promise.resolve({ success: true }));
      
      component.email = 'test@example.com';
      component.password = 'password123';
      
      await component.signInWithEmail();
      
      expect(mockAuthService.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should navigate to feed on successful login', async () => {
      mockAuthService.signInWithEmail.and.returnValue(Promise.resolve({ success: true }));
      
      component.email = 'test@example.com';
      component.password = 'password123';
      
      await component.signInWithEmail();
      
      expect(component.successMessage).toContain('Login realizado com sucesso');
      // Verificar se navega após timeout
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/feed']);
      }, 1100);
    });

    it('should show error message on login failure', async () => {
      mockAuthService.signInWithEmail.and.returnValue(Promise.resolve({ 
        success: false, 
        error: 'Invalid credentials' 
      }));
      
      component.email = 'test@example.com';
      component.password = 'wrongpassword';
      
      await component.signInWithEmail();
      
      expect(component.errorMessage).toContain('Invalid credentials');
    });
  });

  describe('🔵 Sign Up Mode', () => {
    beforeEach(() => {
      component.showEmailForm = true;
      component.isSignUp = true;
      fixture.detectChanges();
    });

    it('should call signUpWithEmail when in sign up mode', async () => {
      mockAuthService.signUpWithEmail.and.returnValue(Promise.resolve({ success: true }));
      
      component.email = 'newuser@example.com';
      component.password = 'password123';
      
      await component.signInWithEmail();
      
      expect(mockAuthService.signUpWithEmail).toHaveBeenCalledWith(
        'newuser@example.com', 
        'password123',
        { full_name: 'newuser' }
      );
    });

    it('should show success message and switch to login mode on successful signup', async () => {
      mockAuthService.signUpWithEmail.and.returnValue(Promise.resolve({ success: true }));
      spyOn(component, 'toggleMode');
      
      component.email = 'newuser@example.com';
      component.password = 'password123';
      
      await component.signInWithEmail();
      
      expect(component.successMessage).toContain('Conta criada');
      expect(component.toggleMode).toHaveBeenCalled();
    });

    it('should toggle between login and signup modes', () => {
      expect(component.isSignUp).toBeTruthy();
      
      component.toggleMode();
      
      expect(component.isSignUp).toBeFalsy();
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });
  });

  describe('🔵 Loading States', () => {
    it('should show loading state during authentication', async () => {
      let resolvePromise: any;
      const promise = new Promise(resolve => { resolvePromise = resolve; });
      mockAuthService.signInWithGoogle.and.returnValue(promise as any);
      
      component.signInWithGoogle();
      
      expect(component.loading).toBeTruthy();
      
      resolvePromise({ success: true });
      await promise;
      
      expect(component.loading).toBeFalsy();
    });

    it('should disable buttons during loading', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const googleBtn = fixture.debugElement.query(By.css('.btn-google'));
      expect(googleBtn.nativeElement.disabled).toBeTruthy();
    });
  });

  describe('🔵 Form Validation', () => {
    it('should clear messages when toggling modes', () => {
      component.errorMessage = 'Some error';
      component.successMessage = 'Some success';
      
      component.toggleMode();
      
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });

    it('should clear form when toggling modes', () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      
      component.toggleMode();
      
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });
  });

  describe('🔵 Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockAuthService.signInWithEmail.and.returnValue(Promise.reject(new Error('Network error')));
      
      component.email = 'test@example.com';
      component.password = 'password123';
      
      await component.signInWithEmail();
      
      expect(component.errorMessage).toContain('Erro inesperado');
      expect(component.loading).toBeFalsy();
    });
  });

  describe('🔵 Accessibility', () => {
    it('should have proper form labels', () => {
      component.showEmailForm = true;
      fixture.detectChanges();
      
      const emailLabel = fixture.debugElement.query(By.css('label[for="email"]'));
      const passwordLabel = fixture.debugElement.query(By.css('label[for="password"]'));
      
      expect(emailLabel).toBeTruthy();
      expect(passwordLabel).toBeTruthy();
    });

    it('should have proper input placeholders', () => {
      component.showEmailForm = true;
      fixture.detectChanges();
      
      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
      
      expect(emailInput.nativeElement.placeholder).toBeTruthy();
      expect(passwordInput.nativeElement.placeholder).toBeTruthy();
    });
  });
}); 