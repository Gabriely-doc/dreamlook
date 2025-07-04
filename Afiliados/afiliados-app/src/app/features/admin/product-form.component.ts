import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';

interface Niche {
  id: string;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="product-form-container">
      <div class="form-header">
        <h2>➕ Cadastrar Novo Produto</h2>
        <p>Adicione um produto manualmente ao sistema</p>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
        <!-- Informações Básicas -->
        <div class="form-section">
          <h3>📋 Informações Básicas</h3>
          
          <div class="form-group">
            <label for="title">Título do Produto *</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title"
              placeholder="Ex: Smartphone Samsung Galaxy S24 Ultra"
              [class.error]="isFieldInvalid('title')">
            <div class="error-message" *ngIf="isFieldInvalid('title')">
              Título é obrigatório (mínimo 5 caracteres)
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea 
              id="description" 
              formControlName="description"
              rows="4"
              placeholder="Descreva as principais características do produto..."
              [class.error]="isFieldInvalid('description')"></textarea>
            <div class="error-message" *ngIf="isFieldInvalid('description')">
              Descrição deve ter pelo menos 20 caracteres
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="brand">Marca</label>
              <input 
                type="text" 
                id="brand" 
                formControlName="brand"
                placeholder="Ex: Samsung, Apple, Nike">
            </div>

            <div class="form-group">
              <label for="category">Categoria</label>
              <input 
                type="text" 
                id="category" 
                formControlName="category"
                placeholder="Ex: Smartphones, Roupas, Eletrônicos">
            </div>
          </div>

          <div class="form-group">
            <label for="niche_id">Nicho *</label>
            <select 
              id="niche_id" 
              formControlName="niche_id"
              [class.error]="isFieldInvalid('niche_id')">
              <option value="">Selecione um nicho</option>
              <option *ngFor="let niche of niches" [value]="niche.id">
                {{niche.name}}
              </option>
            </select>
            <div class="error-message" *ngIf="isFieldInvalid('niche_id')">
              Selecione um nicho
            </div>
          </div>
        </div>

        <!-- Preços -->
        <div class="form-section">
          <h3>💰 Preços</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="original_price">Preço Original</label>
              <input 
                type="number" 
                id="original_price" 
                formControlName="original_price"
                step="0.01"
                placeholder="199.99">
            </div>

            <div class="form-group">
              <label for="current_price">Preço Promocional *</label>
              <input 
                type="number" 
                id="current_price" 
                formControlName="current_price"
                step="0.01"
                placeholder="149.99"
                [class.error]="isFieldInvalid('current_price')">
              <div class="error-message" *ngIf="isFieldInvalid('current_price')">
                Preço atual é obrigatório e deve ser maior que 0
              </div>
            </div>
          </div>

          <div class="discount-preview" *ngIf="discountPercentage > 0">
            <span class="discount-badge">{{discountPercentage}}% OFF</span>
          </div>
        </div>

        <!-- URLs -->
        <div class="form-section">
          <h3>🔗 Links</h3>
          
          <div class="form-group">
            <label for="affiliate_url">URL de Afiliado *</label>
            <input 
              type="url" 
              id="affiliate_url" 
              formControlName="affiliate_url"
              placeholder="https://amzn.to/..."
              [class.error]="isFieldInvalid('affiliate_url')">
            <div class="error-message" *ngIf="isFieldInvalid('affiliate_url')">
              URL de afiliado é obrigatória e deve ser válida
            </div>
          </div>

          <div class="form-group">
            <label for="product_url">URL Original do Produto</label>
            <input 
              type="url" 
              id="product_url" 
              formControlName="product_url"
              placeholder="https://www.amazon.com.br/produto">
          </div>
        </div>

        <!-- Imagens -->
        <div class="form-section">
          <h3>🖼️ Imagens</h3>
          
          <div class="form-group">
            <label for="image_url">URL da Imagem Principal *</label>
            <input 
              type="url" 
              id="image_url" 
              formControlName="image_url"
              placeholder="https://exemplo.com/imagem.jpg"
              [class.error]="isFieldInvalid('image_url')">
            <div class="error-message" *ngIf="isFieldInvalid('image_url')">
              URL da imagem é obrigatória e deve ser válida
            </div>
          </div>

          <div class="image-preview" *ngIf="productForm.get('image_url')?.value">
            <img 
              [src]="productForm.get('image_url')?.value" 
              alt="Preview"
              (error)="onImageError($event)"
              (load)="onImageLoad()">
          </div>

          <div class="form-group">
            <label>Imagens Adicionais</label>
            <div formArrayName="additional_images">
              <div *ngFor="let imageControl of additionalImages.controls; let i = index" class="image-input-group">
                <input 
                  type="url" 
                  [formControlName]="i"
                  placeholder="https://exemplo.com/imagem-adicional.jpg">
                <button type="button" class="btn-remove" (click)="removeImage(i)">❌</button>
              </div>
            </div>
            <button type="button" class="btn-add-image" (click)="addImageField()">
              ➕ Adicionar Imagem
            </button>
          </div>
        </div>

        <!-- Tags -->
        <div class="form-section">
          <h3>🏷️ Tags</h3>
          
          <div class="form-group">
            <label for="tags">Tags (separadas por vírgula)</label>
            <input 
              type="text" 
              id="tags" 
              formControlName="tags"
              placeholder="smartphone, android, 5g, câmera">
            <small>Adicione palavras-chave separadas por vírgula</small>
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="productForm.invalid || isSubmitting">
            <span *ngIf="!isSubmitting">💾 Salvar Produto</span>
            <span *ngIf="isSubmitting">⏳ Salvando...</span>
          </button>
        </div>
      </form>

      <!-- Mensagens de Feedback -->
      <div class="alert alert-success" *ngIf="successMessage">
        ✅ {{successMessage}}
      </div>
      
      <div class="alert alert-error" *ngIf="errorMessage">
        ❌ {{errorMessage}}
      </div>
    </div>
  `,
  styles: [`
    .product-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .form-header h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .form-header p {
      color: #666;
      margin: 0;
    }

    .product-form {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .form-section:last-child {
      border-bottom: none;
    }

    .form-section h3 {
      color: #333;
      margin-bottom: 20px;
      font-size: 18px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    input, textarea, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #007bff;
    }

    input.error, textarea.error, select.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    small {
      color: #666;
      font-size: 12px;
    }

    .discount-preview {
      margin-top: 10px;
    }

    .discount-badge {
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .image-preview {
      margin-top: 10px;
      text-align: center;
    }

    .image-preview img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .image-input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: center;
    }

    .image-input-group input {
      flex: 1;
    }

    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-add-image {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .alert {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      font-weight: 500;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  niches: Niche[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadNiches();
    this.setupFormWatchers();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.minLength(20)]],
      brand: [''],
      category: [''],
      niche_id: ['', Validators.required],
      original_price: [null, [Validators.min(0)]],
      current_price: [null, [Validators.required, Validators.min(0.01)]],
      affiliate_url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      product_url: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      image_url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      additional_images: this.fb.array([]),
      tags: ['']
    });
  }

  get additionalImages(): FormArray {
    return this.productForm.get('additional_images') as FormArray;
  }

  get discountPercentage(): number {
    const original = this.productForm.get('original_price')?.value;
    const current = this.productForm.get('current_price')?.value;
    
    if (original && current && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  }

  private async loadNiches(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('niches')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      this.niches = data || [];
    } catch (error) {
      console.error('Erro ao carregar nichos:', error);
      this.errorMessage = 'Erro ao carregar nichos disponíveis';
    }
  }

  private setupFormWatchers(): void {
    // Limpar mensagens quando formulário é modificado
    this.productForm.valueChanges.subscribe(() => {
      if (this.successMessage || this.errorMessage) {
        this.successMessage = '';
        this.errorMessage = '';
      }
    });
  }

  addImageField(): void {
    this.additionalImages.push(this.fb.control('', [Validators.pattern(/^https?:\/\/.+/)]));
  }

  removeImage(index: number): void {
    this.additionalImages.removeAt(index);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  onImageLoad(): void {
    // Imagem carregou com sucesso
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const currentUser = this.authService.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const formData = this.productForm.value;
      
      // Processar tags
      const tags = formData.tags 
        ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];

      // Processar imagens adicionais
      const additionalImages = formData.additional_images.filter((url: string) => url.trim());

      const productData = {
        title: formData.title,
        description: formData.description || null,
        brand: formData.brand || null,
        category: formData.category || null,
        niche_id: formData.niche_id,
        original_price: formData.original_price || null,
        current_price: formData.current_price,
        affiliate_url: formData.affiliate_url,
        product_url: formData.product_url || null,
        image_url: formData.image_url,
        images: additionalImages.length > 0 ? additionalImages : [],
        tags: tags,
        status: 'pending', // Produtos manuais também passam por moderação
        created_by: currentUser.id
      };

      const { data, error } = await this.supabaseService.client
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      this.successMessage = 'Produto cadastrado com sucesso! Aguardando moderação.';
      this.productForm.reset();
      this.additionalImages.clear();

      // Redirecionar após 2 segundos
      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao cadastrar produto:', error);
      this.errorMessage = error.message || 'Erro ao cadastrar produto. Tente novamente.';
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }
}
