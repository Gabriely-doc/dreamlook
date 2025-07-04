import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <h2>Painel Administrativo</h2>
      
      <div class="admin-cards">
        <div class="admin-card">
          <h3>📊 Estatísticas</h3>
          <p>Visualizar métricas do aplicativo</p>
          <button class="btn-primary" disabled>Em breve</button>
        </div>
        
        <div class="admin-card">
          <h3>✅ Moderação</h3>
          <p>Aprovar ou rejeitar produtos pendentes</p>
          <a routerLink="/admin/moderation" class="btn-primary">Acessar</a>
        </div>
        
        <div class="admin-card">
          <h3>➕ Produtos</h3>
          <p>Adicionar novos produtos manualmente</p>
          <a routerLink="/admin/products/new" class="btn-primary">Cadastrar</a>
        </div>
        
        <div class="admin-card">
          <h3>👥 Usuários</h3>
          <p>Gerenciar usuários e permissões</p>
          <button class="btn-primary" disabled>Em breve</button>
        </div>
      </div>
      
      <div class="admin-info">
        <h3>🔒 Área Administrativa</h3>
        <p>Você está logado como administrador. Use estas ferramentas com cuidado.</p>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }

    .admin-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .admin-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s;
    }

    .admin-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .admin-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 18px;
    }

    .admin-card p {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .admin-info {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .admin-info h3 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .admin-info p {
      margin: 0;
      color: #333;
    }

    @media (max-width: 768px) {
      .admin-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  
} 