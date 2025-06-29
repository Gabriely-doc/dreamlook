import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAdminAccess();
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAdminAccess();
  }

  private checkAdminAccess(): boolean {
    try {
      // Verificar se usuário está autenticado
      if (!this.authService.isAuthenticated) {
        this.router.navigate(['/auth']);
        return false;
      }

      // Verificar se usuário é admin
      if (!this.authService.isAdmin()) {
        this.router.navigate(['/']);
        return false;
      }

      return true;
    } catch (error) {
      // Em caso de erro, redirecionar para login por segurança
      this.router.navigate(['/auth']);
      return false;
    }
  }
} 