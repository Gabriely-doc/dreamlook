import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';

interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  original_price: number;
  current_price: number;
  affiliate_url: string;
  image_url: string;
  status: string;
  created_at: string;
  created_by: string;
  niche: string;
}

@Component({
  selector: 'app-product-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="moderation-container">
      <h2>Moderação de Produtos</h2>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Carregando produtos pendentes...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        <p>{{ error }}</p>
        <button (click)="loadPendingProducts()" class="btn-retry">Tentar Novamente</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && pendingProducts.length === 0" class="empty-state">
        <p>Nenhum produto pendente para moderação.</p>
      </div>

      <!-- Products Table -->
      <div *ngIf="!loading && !error && pendingProducts.length > 0" class="products-table">
        <div class="table-header">
          <div class="header-cell">Imagem</div>
          <div class="header-cell">Produto</div>
          <div class="header-cell">Marca</div>
          <div class="header-cell">Preço</div>
          <div class="header-cell">Categoria</div>
          <div class="header-cell">Data</div>
          <div class="header-cell">Ações</div>
        </div>

        <div *ngFor="let product of pendingProducts; trackBy: trackByProductId" class="product-row">
          <div class="cell image-cell">
            <img [src]="product.image_url" [alt]="product.title" class="product-image">
          </div>
          
          <div class="cell product-info">
            <h4>{{ product.title }}</h4>
            <p class="description">{{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}</p>
          </div>
          
          <div class="cell">
            {{ product.brand }}
          </div>
          
          <div class="cell price-cell">
            <div class="price-info">
              <span class="current-price">R$ {{ product.current_price | number:'1.2-2' }}</span>
              <span *ngIf="product.original_price !== product.current_price" class="original-price">
                R$ {{ product.original_price | number:'1.2-2' }}
              </span>
            </div>
          </div>
          
          <div class="cell">
            {{ product.category }}
          </div>
          
          <div class="cell">
            {{ product.created_at | date:'dd/MM/yyyy' }}
          </div>
          
          <div class="cell actions-cell">
            <button 
              (click)="approveProduct(product.id)"
              [disabled]="processingProductId === product.id"
              class="btn-approve">
              <span *ngIf="processingProductId === product.id" class="processing">⏳</span>
              <span *ngIf="processingProductId !== product.id">✅ Aprovar</span>
            </button>
            
            <button 
              (click)="rejectProduct(product.id)"
              [disabled]="processingProductId === product.id"
              class="btn-reject">
              <span *ngIf="processingProductId === product.id" class="processing">⏳</span>
              <span *ngIf="processingProductId !== product.id">❌ Rejeitar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .moderation-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .loading-spinner {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
      margin-bottom: 20px;
    }

    .btn-retry {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }

    .products-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 80px 2fr 1fr 1fr 1fr 1fr 2fr;
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    .header-cell {
      padding: 15px 10px;
      font-weight: bold;
      color: #495057;
      text-align: center;
    }

    .product-row {
      display: grid;
      grid-template-columns: 80px 2fr 1fr 1fr 1fr 1fr 2fr;
      border-bottom: 1px solid #dee2e6;
      transition: background-color 0.2s;
    }

    .product-row:hover {
      background-color: #f8f9fa;
    }

    .cell {
      padding: 15px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .image-cell {
      padding: 10px;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }

    .product-info {
      text-align: left;
      flex-direction: column;
      align-items: flex-start;
    }

    .product-info h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .description {
      margin: 0;
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }

    .price-cell {
      flex-direction: column;
    }

    .current-price {
      font-weight: bold;
      color: #28a745;
      font-size: 14px;
    }

    .original-price {
      text-decoration: line-through;
      color: #999;
      font-size: 12px;
    }

    .actions-cell {
      gap: 10px;
    }

    .btn-approve, .btn-reject {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
      min-width: 80px;
    }

    .btn-approve {
      background: #28a745;
      color: white;
    }

    .btn-approve:hover:not(:disabled) {
      background: #218838;
    }

    .btn-reject {
      background: #dc3545;
      color: white;
    }

    .btn-reject:hover:not(:disabled) {
      background: #c82333;
    }

    .btn-approve:disabled, .btn-reject:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .processing {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 768px) {
      .table-header, .product-row {
        grid-template-columns: 1fr;
        gap: 10px;
      }
      
      .cell {
        border-bottom: 1px solid #eee;
        justify-content: flex-start;
        text-align: left;
      }
      
      .actions-cell {
        justify-content: center;
        border-bottom: none;
      }
    }
  `]
})
export class ProductModerationComponent implements OnInit {
  pendingProducts: Product[] = [];
  loading = false;
  error = '';
  processingProductId: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPendingProducts();
  }

  async loadPendingProducts() {
    this.loading = true;
    this.error = '';
    
    try {
      this.supabaseService.getProducts('pending').subscribe({
        next: (products) => {
          this.pendingProducts = products;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar produtos pendentes:', err);
          this.error = 'Erro ao carregar produtos pendentes. Tente novamente.';
          this.loading = false;
        }
      });
    } catch (err) {
      console.error('Erro ao carregar produtos pendentes:', err);
      this.error = 'Erro ao carregar produtos pendentes. Tente novamente.';
      this.loading = false;
    }
  }

  async approveProduct(productId: string) {
    this.processingProductId = productId;
    this.error = '';

    try {
      const result = await this.supabaseService.updateProductStatus(productId, 'approved');
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Remove produto da lista após aprovação
      this.pendingProducts = this.pendingProducts.filter(p => p.id !== productId);
      console.log(`Produto ${productId} aprovado com sucesso`);
      
    } catch (err: any) {
      console.error('Erro ao aprovar produto:', err);
      this.error = `Erro ao aprovar produto: ${err.message || 'Erro desconhecido'}`;
    } finally {
      this.processingProductId = null;
    }
  }

  async rejectProduct(productId: string) {
    this.processingProductId = productId;
    this.error = '';

    try {
      const result = await this.supabaseService.updateProductStatus(productId, 'rejected');
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Remove produto da lista após rejeição
      this.pendingProducts = this.pendingProducts.filter(p => p.id !== productId);
      console.log(`Produto ${productId} rejeitado com sucesso`);
      
    } catch (err: any) {
      console.error('Erro ao rejeitar produto:', err);
      this.error = `Erro ao rejeitar produto: ${err.message || 'Erro desconhecido'}`;
    } finally {
      this.processingProductId = null;
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
} 