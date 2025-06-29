import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login.component').then(m => m.LoginComponent)
  }
]; 