import { Injectable, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { fromEvent, merge, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService implements OnInit {
  isOnline = true;
  deferredPrompt: any;
  canInstallPWA = false;

  constructor(private swUpdate: SwUpdate) {
    // Monitorar status da conexão
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    ).subscribe(isOnline => {
      this.isOnline = isOnline;
    });
  }

  ngOnInit(): void {
    // Verificar atualizações do PWA
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          if (confirm('Nova versão disponível! Deseja recarregar?')) {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
          }
        }
      });
      
      this.swUpdate.checkForUpdate();
    }

    // Lidar com prompt de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstallPWA = true;
    });
  }

  installPWA(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou instalar o PWA');
        } else {
          console.log('Usuário recusou instalar o PWA');
        }
        this.deferredPrompt = null;
        this.canInstallPWA = false;
      });
    }
  }
} 