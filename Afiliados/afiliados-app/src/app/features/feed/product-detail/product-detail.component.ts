import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ProductCommentsComponent } from '../products-coments/product-comments.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ProductCommentsComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  async loadProduct(productId: string) {
    this.supabaseService.getProductById(productId).subscribe(
      (product) => {
        this.product = product;
        this.loading = false;
      },
      (err) => {
        this.error = true;
        this.loading = false;
        console.error('Erro ao carregar produto:', err);
      }
    );
  }
} 