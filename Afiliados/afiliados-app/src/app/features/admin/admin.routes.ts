import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard]
  }
]; 