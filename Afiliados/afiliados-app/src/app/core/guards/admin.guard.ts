import { Injectable, Injector } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private injector: Injector
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
    const router = this.injector.get(Router);
    
    try {
      // Verificar se usuário está autenticado
      if (!this.authService.isAuthenticated) {
        router.navigate(['/auth']);
        return false;
      }

      // Verificar se usuário é admin
      if (!this.authService.isAdmin()) {
        router.navigate(['/']);
        return false;
      }

      return true;
    } catch (error) {
      // Em caso de erro, redirecionar para login por segurança
      router.navigate(['/auth']);
      return false;
    }
  }
} 