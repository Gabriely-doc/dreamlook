import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedProdutosComponent } from './feed-produtos.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('FeedProdutosComponent', () => {
  let component: FeedProdutosComponent;
  let fixture: ComponentFixture<FeedProdutosComponent>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;

  const mockProducts = [
    {
      id: '1',
      name: 'Kit Skincare Coreano Completo',
      price: 89.99,
      image_url: 'https://example.com/image1.jpg',
      affiliate_link: 'https://shopee.com/product1',
      vote_score: 15,
      niche: 'beleza',
      created_at: '2024-01-01T00:00:00Z',
      user_vote: null
    },
    {
      id: '2',
      name: 'Máscara Facial Hidratante',
      price: 24.99,
      image_url: 'https://example.com/image2.jpg',
      affiliate_link: 'https://shopee.com/product2',
      vote_score: 8,
      niche: 'beleza',
      created_at: '2024-01-02T00:00:00Z',
      user_vote: null
    }
  ];

  beforeEach(async () => {
    const supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [
      'getProducts',
      'getProductsByNiche',
      'loadMoreProducts',
      'voteProduct'
    ]);

    await TestBed.configureTestingModule({
      imports: [FeedProdutosComponent],
      providers: [
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedProdutosComponent);
    component = fixture.componentInstance;
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('🔴 Component Initialization', () => {
    it('should initialize with empty products array', () => {
      expect(component.products).toEqual([]);
    });

    it('should initialize with loading state false', () => {
      expect(component.loading).toBeFalsy();
    });

    it('should initialize with hasMore true', () => {
      expect(component.hasMore).toBeTruthy();
    });

    it('should initialize with page 0', () => {
      expect(component.currentPage).toBe(0);
    });

    it('should initialize with current niche from environment', () => {
      expect(component.currentNiche).toBe('beleza');
    });

    it('should initialize niche info correctly', () => {
      expect(component.currentNicheInfo).toBeDefined();
      expect(component.currentNicheInfo.label).toBe('beleza');
      expect(component.currentNicheInfo.emoji).toBe('💄');
    });
  });

  describe('🔴 Product Loading', () => {
    it('should load products for current niche on init', () => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      component.ngOnInit();
      
      expect(mockSupabaseService.getProductsByNiche).toHaveBeenCalledWith('beleza', 0, 10);
    });

    it('should set products after loading', () => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      component.ngOnInit();
      
      expect(component.products).toEqual(mockProducts);
    });

    it('should set loading to true during load', () => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      component.loadProducts();
      
      expect(component.loading).toBeTruthy();
    });

    it('should set loading to false after load', async () => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      await component.loadProducts();
      
      expect(component.loading).toBeFalsy();
    });

    it('should handle loading errors gracefully', async () => {
      mockSupabaseService.getProductsByNiche.and.returnValue(throwError('Network error'));
      
      await component.loadProducts();
      
      expect(component.loading).toBeFalsy();
      expect(component.error).toContain('Erro ao carregar produtos de beleza');
    });
  });

  describe('🔴 Niche-Specific Functionality', () => {
    it('should load products only for current niche', () => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      component.loadProducts();
      
      expect(mockSupabaseService.getProductsByNiche).toHaveBeenCalledWith('beleza', 0, 10);
    });

    it('should apply niche theme on initialization', () => {
      spyOn(FeedProdutosComponent.prototype as any, 'applyNicheTheme');
      
      const newComponent = new FeedProdutosComponent(mockSupabaseService);
      
      expect((FeedProdutosComponent.prototype as any).applyNicheTheme).toHaveBeenCalled();
    });

    it('should get correct emoji for niche', () => {
      expect(component.getNicheEmoji('beleza')).toBe('💄');
      expect(component.getNicheEmoji('moda')).toBe('👗');
      expect(component.getNicheEmoji('cozinha')).toBe('🍳');
    });
  });

  describe('🔴 Infinite Scroll', () => {
    it('should load more products when scrolling', () => {
      component.products = mockProducts;
      component.currentPage = 0;
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      component.loadMoreProducts();
      
      expect(mockSupabaseService.getProductsByNiche).toHaveBeenCalledWith('beleza', 1, 10);
    });

    it('should append new products to existing list', async () => {
      component.products = [mockProducts[0]];
      component.currentPage = 0;
      mockSupabaseService.getProductsByNiche.and.returnValue(of([mockProducts[1]]));
      
      await component.loadMoreProducts();
      
      expect(component.products.length).toBe(2);
      expect(component.products).toContain(mockProducts[1]);
    });

    it('should increment page number after loading more', async () => {
      component.currentPage = 0;
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      
      await component.loadMoreProducts();
      
      expect(component.currentPage).toBe(1);
    });

    it('should set hasMore to false when no more products', async () => {
      component.currentPage = 0;
      mockSupabaseService.getProductsByNiche.and.returnValue(of([]));
      
      await component.loadMoreProducts();
      
      expect(component.hasMore).toBeFalsy();
    });

    it('should not load more when already loading', () => {
      component.loading = true;
      
      component.loadMoreProducts();
      
      expect(mockSupabaseService.getProductsByNiche).not.toHaveBeenCalled();
    });

    it('should not load more when no more products available', () => {
      component.hasMore = false;
      
      component.loadMoreProducts();
      
      expect(mockSupabaseService.getProductsByNiche).not.toHaveBeenCalled();
    });
  });

  describe('🔴 UI Rendering', () => {
    beforeEach(() => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display niche header', () => {
      const nicheHeader = fixture.debugElement.query(By.css('.niche-header'));
      expect(nicheHeader).toBeTruthy();
      
      const title = nicheHeader.query(By.css('h2'));
      expect(title.nativeElement.textContent).toContain('💄');
      expect(title.nativeElement.textContent).toContain('Beleza Barata');
    });

    it('should display product cards', () => {
      const productCards = fixture.debugElement.queryAll(By.css('.product-card'));
      expect(productCards.length).toBe(mockProducts.length);
    });

    it('should display product images', () => {
      const productImages = fixture.debugElement.queryAll(By.css('.product-image'));
      expect(productImages.length).toBe(mockProducts.length);
      expect(productImages[0].nativeElement.src).toBe(mockProducts[0].image_url);
    });

    it('should display product names', () => {
      const productNames = fixture.debugElement.queryAll(By.css('.product-name'));
      expect(productNames.length).toBe(mockProducts.length);
      expect(productNames[0].nativeElement.textContent).toContain(mockProducts[0].name);
    });

    it('should display product prices', () => {
      const productPrices = fixture.debugElement.queryAll(By.css('.product-price'));
      expect(productPrices.length).toBe(mockProducts.length);
      expect(productPrices[0].nativeElement.textContent).toContain('R$ 89,99');
    });

    it('should display vote scores', () => {
      const voteScores = fixture.debugElement.queryAll(By.css('.vote-score'));
      expect(voteScores.length).toBe(mockProducts.length);
      expect(voteScores[0].nativeElement.textContent).toContain('15');
    });

    it('should display niche badges on products', () => {
      const nicheBadges = fixture.debugElement.queryAll(By.css('.niche-badge-small'));
      expect(nicheBadges.length).toBe(mockProducts.length);
      expect(nicheBadges[0].nativeElement.textContent).toContain('💄');
    });
  });

  describe('🔴 Vote Buttons', () => {
    beforeEach(() => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display upvote buttons', () => {
      const upvoteButtons = fixture.debugElement.queryAll(By.css('.btn-upvote'));
      expect(upvoteButtons.length).toBe(mockProducts.length);
    });

    it('should display downvote buttons', () => {
      const downvoteButtons = fixture.debugElement.queryAll(By.css('.btn-downvote'));
      expect(downvoteButtons.length).toBe(mockProducts.length);
    });

    it('should emit upvote event when upvote button clicked', () => {
      spyOn(component.upvote, 'emit');
      
      const upvoteButton = fixture.debugElement.query(By.css('.btn-upvote'));
      upvoteButton.nativeElement.click();
      
      expect(component.upvote.emit).toHaveBeenCalledWith(mockProducts[0].id);
    });

    it('should emit downvote event when downvote button clicked', () => {
      spyOn(component.downvote, 'emit');
      
      const downvoteButton = fixture.debugElement.query(By.css('.btn-downvote'));
      downvoteButton.nativeElement.click();
      
      expect(component.downvote.emit).toHaveBeenCalledWith(mockProducts[0].id);
    });
  });

  describe('🔴 Loading States', () => {
    it('should show loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const loadingSpinner = fixture.debugElement.query(By.css('.loading-spinner'));
      expect(loadingSpinner).toBeTruthy();
    });

    it('should show niche-specific loading message', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const loadingContainer = fixture.debugElement.query(By.css('.loading-container'));
      expect(loadingContainer.nativeElement.textContent).toContain('Carregando produtos de beleza');
    });

    it('should hide products when loading', () => {
      component.loading = true;
      component.products = mockProducts;
      fixture.detectChanges();
      
      const productCards = fixture.debugElement.queryAll(By.css('.product-card'));
      expect(productCards.length).toBe(0);
    });

    it('should show error message when error occurs', () => {
      component.error = 'Erro ao carregar produtos de beleza';
      fixture.detectChanges();
      
      const errorMessage = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain('Erro ao carregar produtos de beleza');
    });
  });

  describe('🔴 Empty States', () => {
    it('should show empty state when no products', () => {
      component.products = [];
      component.loading = false;
      fixture.detectChanges();
      
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });

    it('should show niche-specific empty message', () => {
      component.products = [];
      component.loading = false;
      fixture.detectChanges();
      
      const emptyMessage = fixture.debugElement.query(By.css('.empty-message'));
      expect(emptyMessage.nativeElement.textContent).toContain('💄');
      expect(emptyMessage.nativeElement.textContent).toContain('produtos de beleza');
    });
  });

  describe('🔴 Scroll Detection', () => {
    it('should detect scroll near bottom', () => {
      const scrollEvent = new Event('scroll');
      spyOn(component, 'loadMoreProducts');
      
      // Mock scroll position near bottom
      spyOnProperty(window, 'innerHeight', 'get').and.returnValue(800);
      spyOnProperty(document.documentElement, 'scrollTop', 'get').and.returnValue(1200);
      spyOnProperty(document.documentElement, 'offsetHeight', 'get').and.returnValue(2000);
      
      component.onScroll(scrollEvent);
      
      expect(component.loadMoreProducts).toHaveBeenCalled();
    });

    it('should not load more when not near bottom', () => {
      const scrollEvent = new Event('scroll');
      spyOn(component, 'loadMoreProducts');
      
      // Mock scroll position not near bottom
      spyOnProperty(window, 'innerHeight', 'get').and.returnValue(800);
      spyOnProperty(document.documentElement, 'scrollTop', 'get').and.returnValue(100);
      spyOnProperty(document.documentElement, 'offsetHeight', 'get').and.returnValue(2000);
      
      component.onScroll(scrollEvent);
      
      expect(component.loadMoreProducts).not.toHaveBeenCalled();
    });
  });

  describe('🔴 Theme Integration', () => {
    it('should apply CSS variables for niche theme', () => {
      spyOn(document.documentElement.style, 'setProperty');
      
      (component as any).applyNicheTheme();
      
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ec4899');
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--secondary-color', '#f472b6');
    });
  });

  describe('�� Vote Visual States', () => {
    beforeEach(() => {
      mockSupabaseService.getProductsByNiche.and.returnValue(of(mockProducts));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should show active upvote button when user voted positive', () => {
      // Simular que o usuário votou positivo
      component.products[0].user_vote = true;
      fixture.detectChanges();
      
      const upvoteButton = fixture.debugElement.query(By.css('.btn-upvote'));
      expect(upvoteButton.nativeElement.classList).toContain('active');
    });

    it('should show active downvote button when user voted negative', () => {
      // Simular que o usuário votou negativo
      component.products[0].user_vote = false;
      fixture.detectChanges();
      
      const downvoteButton = fixture.debugElement.query(By.css('.btn-downvote'));
      expect(downvoteButton.nativeElement.classList).toContain('active');
    });

    it('should show no active buttons when user has not voted', () => {
      // Simular que o usuário não votou
      component.products[0].user_vote = null;
      fixture.detectChanges();
      
      const upvoteButton = fixture.debugElement.query(By.css('.btn-upvote'));
      const downvoteButton = fixture.debugElement.query(By.css('.btn-downvote'));
      
      expect(upvoteButton.nativeElement.classList).not.toContain('active');
      expect(downvoteButton.nativeElement.classList).not.toContain('active');
    });

    it('should update visual state after voting', async () => {
      const mockResult = {
        success: true,
        action: 'created',
        vote_counts: { heat_score: 10 },
        user_vote: true
      };
      
      mockSupabaseService.voteProduct.and.returnValue(Promise.resolve(mockResult));
      
      await component.handleVote(mockProducts[0].id, true);
      fixture.detectChanges();
      
      expect(component.products[0].user_vote).toBe(true);
    });
  });
}); 