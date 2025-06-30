import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>🔐 Login</h2>
        <p>Entre para acessar sua conta</p>
        
        <!-- Formulário de Email/Senha -->
        <form *ngIf="!showEmailForm" class="login-buttons">
          <button type="button" class="btn-google" (click)="signInWithGoogle()" [disabled]="loading">
            <span>🔗</span> Entrar com Google
          </button>
          <button type="button" class="btn-email" (click)="showEmailForm = true">
            <span>📧</span> Entrar com Email
          </button>
        </form>

        <!-- Formulário Email/Senha -->
        <form *ngIf="showEmailForm" (ngSubmit)="signInWithEmail()" class="email-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email"
              required 
              placeholder="seu@email.com"
              [disabled]="loading">
          </div>
          
          <div class="form-group">
            <label for="password">Senha:</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password"
              required 
              placeholder="Sua senha"
              [disabled]="loading">
          </div>

          <div class="form-buttons">
            <button type="submit" class="btn-primary" [disabled]="loading || !email || !password">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
            <button type="button" class="btn-secondary" (click)="showEmailForm = false" [disabled]="loading">
              Voltar
            </button>
          </div>

          <div class="form-links">
            <a href="#" (click)="toggleMode($event)">
              {{ isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar conta' }}
            </a>
          </div>
        </form>

        <!-- Mensagens de erro/sucesso -->
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <p class="login-note">
          {{ isSignUp ? 'Crie sua conta gratuitamente!' : 'Ainda não tem conta? Registre-se gratuitamente!' }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      padding: 3rem;
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    
    .login-card h2 {
      color: #8b5cf6;
      margin-bottom: 1rem;
    }
    
    .login-card p {
      color: #6b7280;
      margin-bottom: 2rem;
    }
    
    .login-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .login-buttons button, .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-google:hover {
      border-color: #dc2626;
      background: #fef2f2;
    }
    
    .btn-email:hover {
      border-color: #8b5cf6;
      background: #faf5ff;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      color: white;
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .email-form {
      text-align: left;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    .form-group input:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }

    .form-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .form-buttons button {
      flex: 1;
    }

    .form-links {
      text-align: center;
      margin-top: 1rem;
    }

    .form-links a {
      color: #8b5cf6;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .form-links a:hover {
      text-decoration: underline;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid #fecaca;
    }

    .success-message {
      background: #f0fdf4;
      color: #16a34a;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid #bbf7d0;
    }
    
    .login-note {
      font-size: 0.9rem;
      color: #9ca3af;
    }
  `]
})
export class LoginComponent {
  showEmailForm = false;
  isSignUp = false;
  loading = false;
  
  email = '';
  password = '';
  
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async signInWithGoogle(): Promise<void> {
    this.loading = true;
    this.clearMessages();

    try {
      const result = await this.authService.signInWithGoogle();
      
      if (result.success) {
        this.successMessage = 'Redirecionando para Google...';
        // O redirecionamento será feito pelo Supabase
      } else {
        this.errorMessage = result.error || 'Erro ao conectar com Google';
      }
    } catch (error) {
      this.errorMessage = 'Erro inesperado. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  async signInWithEmail(): Promise<void> {
    this.loading = true;
    this.clearMessages();

    try {
      let result;
      
      if (this.isSignUp) {
        result = await this.authService.signUpWithEmail(this.email, this.password, this.email.split('@')[0]);
        
        if (result.success) {
          this.successMessage = 'Conta criada! Verifique seu email para confirmar.';
          this.toggleMode();
        }
      } else {
        result = await this.authService.signInWithEmail(this.email, this.password);
        
        if (result.success) {
          this.successMessage = 'Login realizado com sucesso!';
          // Redirecionar para feed após login
          setTimeout(() => {
            this.router.navigate(['/feed']);
          }, 1000);
        }
      }

      if (!result.success) {
        this.errorMessage = result.error || 'Erro na autenticação';
      }
    } catch (error) {
      this.errorMessage = 'Erro inesperado. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  toggleMode(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.isSignUp = !this.isSignUp;
    this.clearMessages();
    this.clearForm();
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private clearForm(): void {
    this.email = '';
    this.password = '';
  }
} 