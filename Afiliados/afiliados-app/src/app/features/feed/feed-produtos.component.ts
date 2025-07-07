import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  affiliate_link: string;
  vote_score: number;
  niche: string;
  created_at: string;
  user_vote?: boolean | null; // null = não votou, true = upvote, false = downvote
}

@Component({
  selector: 'app-feed-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="feed-container">
      <!-- Header do Nicho Atual -->
      <div class="niche-header">
        <h2>{{currentNicheInfo.emoji}} {{currentNicheInfo.name}}</h2>
        <p>Os melhores produtos de {{currentNicheInfo.label}} com desconto!</p>
        <div class="niche-badge">
          <span>Especializado em {{currentNicheInfo.label}}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando produtos de {{currentNicheInfo.label}}...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        <p>{{error}}</p>
        <button (click)="loadProducts()" class="btn-retry">Tentar Novamente</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0 && !error" class="empty-state">
        <div class="empty-message">
          <h3>{{currentNicheInfo.emoji}} Nenhum produto encontrado</h3>
          <p>Não encontramos produtos de {{currentNicheInfo.label}} ainda. Volte em breve!</p>
        </div>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!loading && products.length > 0" class="products-grid">
        <div *ngFor="let product of products" class="product-card">
          <!-- Product Image -->
          <div class="product-image-container">
            <img 
              [src]="product.image_url" 
              [alt]="product.name"
              class="product-image"
              (error)="onImageError($event)">
            <div class="niche-badge-small">{{currentNicheInfo.emoji}}</div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h3 class="product-name">{{product.name}}</h3>
            <p class="product-price">R$ {{formatPrice(product.price)}}</p>
            
            <!-- Vote Section -->
            <div class="vote-section">
              <button 
                class="btn-upvote"
                [class.active]="product.user_vote === true"
                [class.loading]="votingProductId === product.id"
                (click)="onUpvote(product.id)"
                [disabled]="loading || votingProductId === product.id">
                <span *ngIf="votingProductId !== product.id">👍</span>
                <span *ngIf="votingProductId === product.id" class="vote-spinner">⏳</span>
              </button>
              <span class="vote-score">{{product.vote_score}}</span>
              <button 
                class="btn-downvote"
                [class.active]="product.user_vote === false"
                [class.loading]="votingProductId === product.id"
                (click)="onDownvote(product.id)"
                [disabled]="loading || votingProductId === product.id">
                <span *ngIf="votingProductId !== product.id">👎</span>
                <span *ngIf="votingProductId === product.id" class="vote-spinner">⏳</span>
              </button>
            </div>

            <!-- Action Button -->
            <a 
              [routerLink]="['/product', product.id]"
              class="btn-buy">
              🛒 Ver Produto
            </a>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div *ngIf="!loading && hasMore && products.length > 0" class="load-more-container">
        <button (click)="loadMoreProducts()" class="btn-load-more">
          Carregar Mais Produtos
        </button>
      </div>
    </div>
  `,
  styles: [`
    .feed-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .niche-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, var(--primary-color, #ec4899), var(--secondary-color, #f472b6));
      border-radius: 16px;
      color: white;
    }

    .niche-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    .niche-header p {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .niche-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid var(--primary-color, #ec4899);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      padding: 2rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .btn-retry {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-message h3 {
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .empty-message p {
      color: #9ca3af;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border-color: var(--primary-color, #ec4899);
    }

    .product-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .product-card:hover .product-image {
      transform: scale(1.05);
    }

    .niche-badge-small {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: var(--primary-color, #ec4899);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .product-info {
      padding: 1rem;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--primary-color, #ec4899);
      margin-bottom: 1rem;
    }

    .vote-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .btn-upvote, .btn-downvote {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
      position: relative;
    }

    .btn-upvote:hover {
      background: #dcfce7;
      transform: scale(1.1);
    }

    .btn-downvote:hover {
      background: #fee2e2;
      transform: scale(1.1);
    }

    .btn-upvote.active {
      background: #22c55e;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
    }

    .btn-downvote.active {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    .btn-upvote.loading, .btn-downvote.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .vote-spinner {
      animation: spin 1s linear infinite;
    }

    .btn-upvote:disabled, .btn-downvote:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .vote-score {
      font-weight: bold;
      color: #374151;
      min-width: 2rem;
      text-align: center;
    }

    .btn-buy {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, var(--primary-color, #ec4899), var(--secondary-color, #f472b6));
      color: white;
      text-decoration: none;
      padding: 0.75rem;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      transition: transform 0.2s;
    }

    .btn-buy:hover {
      transform: translateY(-2px);
    }

    .load-more-container {
      text-align: center;
      margin-top: 2rem;
    }

    .btn-load-more {
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #d1d5db;
      padding: 1rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-load-more:hover {
      background: #e5e7eb;
      border-color: var(--primary-color, #ec4899);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .niche-header h2 {
        font-size: 1.5rem;
      }
      
      .niche-header p {
        font-size: 1rem;
      }
    }
  `]
})
export class FeedProdutosComponent implements OnInit {
  @Output() upvote = new EventEmitter<string>();
  @Output() downvote = new EventEmitter<string>();

  products: Product[] = [];
  loading = false;
  error = '';
  hasMore = true;
  currentPage = 0;
  pageSize = 10;
  currentNiche = environment.niches.current;
  currentNicheInfo: any;
  votingProductId: string | null = null;

  constructor(private supabaseService: SupabaseService) {
    // Configurar informações do nicho atual
    this.currentNicheInfo = {
      ...(environment.niches.themes as any)[this.currentNiche],
      label: this.currentNiche,
      emoji: this.getNicheEmoji(this.currentNiche)
    };
    
    // Aplicar CSS variables para o tema
    this.applyNicheTheme();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      
      // Carregar apenas produtos do nicho atual
      const products = await this.supabaseService.getProductsByNiche(
        this.currentNiche, 
        this.currentPage, 
        this.pageSize
      ).toPromise();
      
      this.products = products || [];
      
      // Carregar estado de votos do usuário
      await this.loadUserVotes();
      
      if (this.products.length < this.pageSize) {
        this.hasMore = false;
      }
    } catch (error) {
      this.error = `Erro ao carregar produtos de ${this.currentNicheInfo.label}. Tente novamente.`;
      console.error('Error loading products:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadUserVotes(): Promise<void> {
    try {
      // TODO: Obter userId do AuthService quando implementado
      const userId = '20000000-0000-0000-0000-000000000002';
      
      if (this.products.length === 0) return;
      
      const productIds = this.products.map(p => p.id);
      const userVotes = await this.supabaseService.getUserVotes(userId, productIds);
      
      // Mapear votos para produtos
      this.products.forEach(product => {
        const vote = userVotes.find(v => v.product_id === product.id);
        product.user_vote = vote ? vote.is_positive : null;
      });
      
    } catch (error) {
      console.error('Error loading user votes:', error);
      // Não mostrar erro para o usuário, apenas log
    }
  }

  async loadMoreProducts(): Promise<void> {
    if (this.loading || !this.hasMore) {
      return;
    }

    try {
      this.loading = true;
      const nextPage = this.currentPage + 1;
      
      // Carregar mais produtos do nicho atual
      const moreProducts = await this.supabaseService.getProductsByNiche(
        this.currentNiche,
        nextPage, 
        this.pageSize
      ).toPromise();
      
      if (moreProducts && moreProducts.length > 0) {
        // Adicionar novos produtos
        const currentLength = this.products.length;
        this.products = [...this.products, ...moreProducts];
        this.currentPage = nextPage;
        
        // Carregar votos apenas para os novos produtos
        await this.loadUserVotesForNewProducts(currentLength);
        
        if (moreProducts.length < this.pageSize) {
          this.hasMore = false;
        }
      } else {
        this.hasMore = false;
      }
    } catch (error) {
      this.error = 'Erro ao carregar mais produtos.';
      console.error('Error loading more products:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadUserVotesForNewProducts(startIndex: number): Promise<void> {
    try {
      const userId = '20000000-0000-0000-0000-000000000002';
      const newProducts = this.products.slice(startIndex);
      
      if (newProducts.length === 0) return;
      
      const productIds = newProducts.map(p => p.id);
      const userVotes = await this.supabaseService.getUserVotes(userId, productIds);
      
      // Mapear votos apenas para os novos produtos
      newProducts.forEach(product => {
        const vote = userVotes.find(v => v.product_id === product.id);
        product.user_vote = vote ? vote.is_positive : null;
      });
      
    } catch (error) {
      console.error('Error loading user votes for new products:', error);
    }
  }

  onUpvote(productId: string): void {
    this.handleVote(productId, true);
  }

  onDownvote(productId: string): void {
    this.handleVote(productId, false);
  }

  async handleVote(productId: string, isPositive: boolean): Promise<void> {
    try {
      // Indicar que este produto está sendo votado
      this.votingProductId = productId;
      
      // TODO: Obter userId do AuthService quando implementado
      // Por enquanto, usar um usuário de exemplo
      const userId = '20000000-0000-0000-0000-000000000002';
      
      const result = await this.supabaseService.voteProduct(userId, productId, isPositive);
      
      if (result.success) {
        // Atualizar o produto na lista local
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          // Usar os contadores atualizados retornados pela função
          const voteCounts = result.vote_counts;
          this.products[productIndex].vote_score = (voteCounts.positive || 0) - (voteCounts.negative || 0);
          
          // Atualizar estado visual do voto
          if (result.action === 'removed') {
            this.products[productIndex].user_vote = null;
          } else {
            this.products[productIndex].user_vote = isPositive;
          }
          
          // Mostrar feedback visual
          console.log(`Voto ${result.action}: ${result.message}`);
          console.log(`Contadores atualizados: +${voteCounts.positive} / -${voteCounts.negative} = ${this.products[productIndex].vote_score}`);
        }
      } else {
        console.error('Erro ao votar:', result.message);
      }
    } catch (error) {
      console.error('Erro ao processar voto:', error);
    } finally {
      // Remover indicador de loading
      this.votingProductId = null;
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',');
  }

  getNicheEmoji(niche: string): string {
    const emojis: { [key: string]: string } = {
      'beleza': '💄',
      'moda': '👗',
      'cozinha': '🍳'
    };
    return emojis[niche] || '🛍️';
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=280&h=200&fit=crop&crop=center&auto=format&q=60';
  }

  trackClick(productId: string): void {
    // Implementar tracking de cliques futuramente
    console.log('Click tracked for product:', productId);
  }

  private applyNicheTheme(): void {
    // Aplicar CSS variables do tema do nicho
    const root = document.documentElement;
    const theme = (environment.niches.themes as any)[this.currentNiche];
    
    if (theme) {
      root.style.setProperty('--primary-color', theme.primaryColor);
      root.style.setProperty('--secondary-color', theme.secondaryColor);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const threshold = 200;
    const position = window.innerHeight + document.documentElement.scrollTop;
    const height = document.documentElement.offsetHeight;
    
    if (position >= height - threshold) {
      this.loadMoreProducts();
    }
  }
} 