import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductFormComponent } from './product-form.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockNiches = [
    { id: '1', name: 'Beleza', slug: 'beleza' },
    { id: '2', name: 'Moda', slug: 'moda' }
  ];

  const mockUser = {
    id: 'user-123',
    email: 'admin@test.com',
    roles: ['admin']
  };

  beforeEach(async () => {
    const supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [], {
      client: {
        from: jasmine.createSpy('from').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            eq: jasmine.createSpy('eq').and.returnValue({
              order: jasmine.createSpy('order').and.returnValue(
                Promise.resolve({ data: mockNiches, error: null })
              )
            })
          }),
          insert: jasmine.createSpy('insert').and.returnValue({
            select: jasmine.createSpy('select').and.returnValue({
              single: jasmine.createSpy('single').and.returnValue(
                Promise.resolve({ data: { id: 'new-product-id' }, error: null })
              )
            })
          })
        })
      }
    });

    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUser
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: SupabaseService, useValue: supabaseServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with correct structure', () => {
    expect(component.productForm).toBeDefined();
    expect(component.productForm.get('title')).toBeDefined();
    expect(component.productForm.get('description')).toBeDefined();
    expect(component.productForm.get('current_price')).toBeDefined();
    expect(component.productForm.get('affiliate_url')).toBeDefined();
    expect(component.productForm.get('image_url')).toBeDefined();
  });

  it('should load niches on init', async () => {
    await component.ngOnInit();
    expect(component.niches).toEqual(mockNiches);
  });

  it('should validate required fields', () => {
    // Marcar campos como touched para ativar validação
    component.productForm.markAllAsTouched();
    
    expect(component.isFieldInvalid('title')).toBeTruthy();
    expect(component.isFieldInvalid('niche_id')).toBeTruthy();
    expect(component.isFieldInvalid('current_price')).toBeTruthy();
    expect(component.isFieldInvalid('affiliate_url')).toBeTruthy();
    expect(component.isFieldInvalid('image_url')).toBeTruthy();
  });

  it('should calculate discount percentage correctly', () => {
    component.productForm.patchValue({
      original_price: 100,
      current_price: 80
    });
    
    expect(component.discountPercentage).toBe(20);
  });

  it('should add and remove additional images', () => {
    expect(component.additionalImages.length).toBe(0);
    
    component.addImageField();
    expect(component.additionalImages.length).toBe(1);
    
    component.removeImage(0);
    expect(component.additionalImages.length).toBe(0);
  });

  it('should submit form with valid data', async () => {
    // Preencher formulário com dados válidos
    component.productForm.patchValue({
      title: 'Produto de Teste',
      description: 'Descrição detalhada do produto de teste com mais de 20 caracteres',
      brand: 'Marca Teste',
      category: 'Categoria Teste',
      niche_id: '1',
      original_price: 100,
      current_price: 80,
      affiliate_url: 'https://example.com/affiliate',
      product_url: 'https://example.com/product',
      image_url: 'https://example.com/image.jpg',
      tags: 'tag1, tag2, tag3'
    });

    await component.onSubmit();

    expect(component.successMessage).toContain('Produto cadastrado com sucesso');
    expect(component.isSubmitting).toBeFalsy();
  });

  it('should handle form submission errors', async () => {
    // Simular erro no Supabase
    const mockClient = mockSupabaseService.client as any;
    mockClient.from.and.returnValue({
      insert: jasmine.createSpy('insert').and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          single: jasmine.createSpy('single').and.returnValue(
            Promise.resolve({ data: null, error: { message: 'Erro de teste' } })
          )
        })
      })
    });

    component.productForm.patchValue({
      title: 'Produto de Teste',
      description: 'Descrição detalhada do produto de teste',
      niche_id: '1',
      current_price: 80,
      affiliate_url: 'https://example.com/affiliate',
      image_url: 'https://example.com/image.jpg'
    });

    await component.onSubmit();

    expect(component.errorMessage).toContain('Erro de teste');
    expect(component.isSubmitting).toBeFalsy();
  });

  it('should navigate to admin on cancel', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });
}); 