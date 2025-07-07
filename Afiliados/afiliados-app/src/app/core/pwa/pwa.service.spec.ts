import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { of } from 'rxjs';
import { PwaService } from './pwa.service';

describe('PwaService', () => {
  let service: PwaService;
  let mockSwUpdate: jasmine.SpyObj<SwUpdate>;

  beforeEach(() => {
    const swUpdateSpy = jasmine.createSpyObj('SwUpdate', ['checkForUpdate', 'activateUpdate'], {
      isEnabled: true,
      versionUpdates: of({ type: 'VERSION_READY' } as VersionReadyEvent)
    });

    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: SwUpdate, useValue: swUpdateSpy }
      ]
    });

    service = TestBed.inject(PwaService);
    mockSwUpdate = TestBed.inject(SwUpdate) as jasmine.SpyObj<SwUpdate>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check for updates on init', () => {
    expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
  });

  it('should prompt user to update when new version is ready', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    // Simular evento de versão pronta
    service.ngOnInit();
    tick();
    
    expect(window.confirm).toHaveBeenCalledWith('Nova versão disponível! Deseja recarregar?');
    expect(mockSwUpdate.activateUpdate).toHaveBeenCalled();
  }));

  it('should handle PWA installation prompt', fakeAsync(() => {
    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      prompt: jasmine.createSpy('prompt'),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };
    
    spyOn(window, 'addEventListener').and.callFake((event, handler) => {
      if (event === 'beforeinstallprompt') {
        handler(mockEvent);
      }
    });

    service.ngOnInit();
    tick();

    expect(service.deferredPrompt).toBe(mockEvent);
    expect(service.canInstallPWA).toBeTruthy();
  }));
  
  it('should handle offline status changes', () => {
    // Simular evento online
    spyOn(window, 'dispatchEvent');
    window.dispatchEvent(new Event('online'));
    expect(service.isOnline).toBeTruthy();
    
    // Simular evento offline
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline).toBeFalsy();
  });
}); 