import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard]
  },
  {
    path: 'moderation',
    loadComponent: () => import('./product-moderation.component').then(m => m.ProductModerationComponent)
  },
  {
    path: 'products/new',
    loadComponent: () => import('./product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'metrics',
    loadComponent: () => import('./metrics-dashboard/metrics-dashboard.component').then(m => m.MetricsDashboardComponent)
  }
]; 