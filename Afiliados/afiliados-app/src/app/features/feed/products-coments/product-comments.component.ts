import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="comments-section">
      <h3>Comentários</h3>
      <div *ngIf="authService.isAuthenticated">
        <form [formGroup]="commentForm" (ngSubmit)="addComment()">
          <textarea formControlName="content" placeholder="Adicione um comentário..."></textarea>
          <button type="submit" [disabled]="commentForm.invalid">Enviar</button>
        </form>
      </div>
      <div *ngIf="!authService.isAuthenticated">
        <p>Você precisa estar logado para comentar.</p>
      </div>
      <div class="comment-list">
        <!-- Loading state -->
        <div *ngIf="loading">Carregando comentários...</div>

        <!-- Empty state -->
        <div *ngIf="!loading && comments.length === 0">
          <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        </div>

        <!-- Comments list -->
        <div *ngFor="let comment of comments" class="comment">
          <p><strong>{{ comment.user_full_name || 'Usuário' }}:</strong> {{ comment.content }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comments-section {
      margin-top: 2rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }
    textarea {
      width: 100%;
      min-height: 80px;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      padding: 0.5rem;
    }
    button {
      margin-top: 0.5rem;
    }
    .comment-list {
      margin-top: 1rem;
    }
    .comment {
      background: white;
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      margin-bottom: 0.5rem;
    }
  `]
})
export class ProductCommentsComponent implements OnInit {
  @Input() productId!: string;

  comments: any[] = [];
  commentForm: FormGroup;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    public authService: AuthService
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.productId) {
      this.loadComments();
    }
  }

  async loadComments() {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('comments')
        .select(`
          content,
          created_at,
          users ( full_name )
        `)
        .eq('product_id', this.productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.comments = data.map(comment => ({
        ...comment,
        user_full_name: (comment as any).users?.full_name
      }));
    } catch (error) {
      console.error('Erro ao carregar comentários', error);
    } finally {
      this.loading = false;
    }
  }

  async addComment() {
    if (this.commentForm.invalid) {
      return;
    }

    try {
      const user = this.authService.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const { content } = this.commentForm.value;
      const { error } = await this.supabaseService.client.from('comments').insert({
        content,
        product_id: this.productId,
        user_id: user.id
      });

      if (error) throw error;

      this.commentForm.reset();
      await this.loadComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  }
} 