import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedComponent } from './feed.component';
import { FeedProdutosComponent } from './feed-produtos.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(async () => {
    const supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [
      'getProducts',
      'getProductsByNiche',
      'loadMoreProducts'
    ]);

    await TestBed.configureTestingModule({
      imports: [FeedComponent],
      providers: [
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    
    // Mock para evitar chamadas reais
    mockSupabaseService.getProducts.and.returnValue(of([]));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const headerElement = fixture.debugElement.query(By.css('.feed-header h1'));
    expect(headerElement.nativeElement.textContent).toContain('🛍️ Deals Hub');
  });

  it('should display the correct subtitle', () => {
    const subtitleElement = fixture.debugElement.query(By.css('.feed-header p'));
    expect(subtitleElement.nativeElement.textContent).toContain('Encontre os melhores produtos com desconto!');
  });

  it('should display stats section', () => {
    const statsSection = fixture.debugElement.query(By.css('.stats'));
    expect(statsSection).toBeTruthy();
    
    const statElements = fixture.debugElement.queryAll(By.css('.stat'));
    expect(statElements.length).toBe(3);
    
    expect(statElements[0].nativeElement.textContent).toContain('🔥 Produtos em Alta');
    expect(statElements[1].nativeElement.textContent).toContain('⭐ Avaliados pela Comunidade');
    expect(statElements[2].nativeElement.textContent).toContain('💰 Melhores Preços');
  });

  it('should include FeedProdutosComponent', () => {
    const feedProdutosComponent = fixture.debugElement.query(By.css('app-feed-produtos'));
    expect(feedProdutosComponent).toBeTruthy();
  });

  it('should have onUpvote method', () => {
    expect(component.onUpvote).toBeDefined();
    expect(typeof component.onUpvote).toBe('function');
  });

  it('should have onDownvote method', () => {
    expect(component.onDownvote).toBeDefined();
    expect(typeof component.onDownvote).toBe('function');
  });

  it('should handle upvote events', () => {
    spyOn(console, 'log');
    
    component.onUpvote('product-1');
    
    expect(console.log).toHaveBeenCalledWith('Upvote product:', 'product-1');
  });

  it('should handle downvote events', () => {
    spyOn(console, 'log');
    
    component.onDownvote('product-2');
    
    expect(console.log).toHaveBeenCalledWith('Downvote product:', 'product-2');
  });

  it('should have proper CSS structure', () => {
    // Verificar container principal
    const feedContainer = fixture.debugElement.query(By.css('.feed-container'));
    expect(feedContainer).toBeTruthy();
    
    // Verificar header
    const feedHeader = fixture.debugElement.query(By.css('.feed-header'));
    expect(feedHeader).toBeTruthy();
  });

  describe('Event Handling', () => {
    it('should emit upvote event from child component', () => {
      const feedProdutosComponent = fixture.debugElement.query(By.css('app-feed-produtos'));
      const feedProdutosInstance = feedProdutosComponent.componentInstance;
      
      spyOn(component, 'onUpvote');
      
      feedProdutosInstance.upvote.emit('test-product-id');
      
      expect(component.onUpvote).toHaveBeenCalledWith('test-product-id');
    });

    it('should emit downvote event from child component', () => {
      const feedProdutosComponent = fixture.debugElement.query(By.css('app-feed-produtos'));
      const feedProdutosInstance = feedProdutosComponent.componentInstance;
      
      spyOn(component, 'onDownvote');
      
      feedProdutosInstance.downvote.emit('test-product-id');
      
      expect(component.onDownvote).toHaveBeenCalledWith('test-product-id');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive stats section', () => {
      const statsSection = fixture.debugElement.query(By.css('.stats'));
      const computedStyle = window.getComputedStyle(statsSection.nativeElement);
      
      expect(computedStyle.display).toBe('flex');
    });

    it('should have proper mobile-friendly structure', () => {
      const statElements = fixture.debugElement.queryAll(By.css('.stat'));
      
      statElements.forEach(stat => {
        const statElement = stat.nativeElement;
        expect(statElement.classList.contains('stat')).toBeTruthy();
      });
    });
  });
}); 