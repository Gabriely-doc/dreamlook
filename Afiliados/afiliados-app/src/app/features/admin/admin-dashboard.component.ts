import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <div class="security-badge">🔒 Rota Protegida - Apenas Admins</div>
        <h1>👨‍💼 Painel Administrativo</h1>
        <p>Gerencie produtos, usuários e métricas</p>
      </header>
      
      <div class="admin-grid">
        <div class="admin-card">
          <h3>📊 Métricas</h3>
          <div class="metric">
            <span class="metric-value">1,234</span>
            <span class="metric-label">Usuários Ativos</span>
          </div>
          <div class="metric">
            <span class="metric-value">567</span>
            <span class="metric-label">Produtos</span>
          </div>
        </div>
        
        <div class="admin-card">
          <h3>🛍️ Produtos Pendentes</h3>
          <p>5 produtos aguardando aprovação</p>
          <button class="btn-primary">Revisar Produtos</button>
        </div>
        
        <div class="admin-card">
          <h3>👥 Usuários</h3>
          <p>Gerencie usuários e permissões</p>
          <button class="btn-secondary">Ver Usuários</button>
        </div>
        
        <div class="admin-card">
          <h3>⚙️ Configurações</h3>
          <p>Configurações do sistema</p>
          <button class="btn-secondary">Configurar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .admin-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .admin-header h1 {
      color: #8b5cf6;
      margin-bottom: 0.5rem;
    }
    
    .admin-header p {
      color: #6b7280;
    }
    
    .security-badge {
      display: inline-block;
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
    }
    
    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .admin-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 2rem;
      text-align: center;
    }
    
    .admin-card h3 {
      color: #374151;
      margin-bottom: 1rem;
    }
    
    .metric {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }
    
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #8b5cf6;
    }
    
    .metric-label {
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-secondary:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }
  `]
})
export class AdminDashboardComponent {
} 