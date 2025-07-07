import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedProdutosComponent } from './feed-produtos.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FeedProdutosComponent],
  template: `
    <div class="feed-container">
      <header class="feed-header">
        <h1>🛍️ Deals Hub</h1>
        <p>Encontre os melhores produtos com desconto!</p>
        <div class="stats">
          <span class="stat">🔥 Produtos em Alta</span>
          <span class="stat">⭐ Avaliados pela Comunidade</span>
          <span class="stat">💰 Melhores Preços</span>
        </div>
      </header>
      
      <!-- Componente de Produtos com Infinite Scroll -->
      <app-feed-produtos>
      </app-feed-produtos>
    </div>
  `,
  styles: [`
    .feed-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .feed-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .feed-header h1 {
      color: #8b5cf6;
      margin-bottom: 10px;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .product-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
    }
    
    .product-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .product-info {
      padding: 15px;
    }
    
    .product-info h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    
    .price {
      margin-bottom: 15px;
    }
    
    .current-price {
      font-weight: bold;
      color: #10b981;
      font-size: 18px;
    }
    
    .original-price {
      text-decoration: line-through;
      color: #6b7280;
      margin-left: 8px;
    }
    
    .votes {
      display: flex;
      gap: 10px;
    }
    
    .vote-btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .vote-btn.up {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .vote-btn.down {
      background: #fef2f2;
      color: #dc2626;
    }
    
    .stats {
      display: flex;
      gap: 2rem;
      justify-content: center;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    
    .stat {
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #374151;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .stats {
        gap: 1rem;
      }
      
      .stat {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }
    }
  `]
})
export class FeedComponent {  

} 