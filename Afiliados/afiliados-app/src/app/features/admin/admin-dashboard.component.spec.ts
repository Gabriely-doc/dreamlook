import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const titleElement = fixture.debugElement.query(By.css('.admin-header h1'));
    expect(titleElement.nativeElement.textContent).toContain('👨‍💼 Painel Administrativo');
  });

  it('should display the correct subtitle', () => {
    const subtitleElement = fixture.debugElement.query(By.css('.admin-header p'));
    expect(subtitleElement.nativeElement.textContent).toContain('Gerencie produtos, usuários e métricas');
  });

  it('should have four admin cards', () => {
    const adminCards = fixture.debugElement.queryAll(By.css('.admin-card'));
    expect(adminCards.length).toBe(4);
  });

  describe('Metrics Card', () => {
    let metricsCard: DebugElement;

    beforeEach(() => {
      metricsCard = fixture.debugElement.query(By.css('.admin-card:first-child'));
    });

    it('should display metrics title', () => {
      const title = metricsCard.query(By.css('h3'));
      expect(title.nativeElement.textContent).toContain('📊 Métricas');
    });

    it('should display user metrics', () => {
      const metrics = metricsCard.queryAll(By.css('.metric'));
      expect(metrics.length).toBe(2);
      
      const userMetric = metrics[0];
      const userValue = userMetric.query(By.css('.metric-value'));
      const userLabel = userMetric.query(By.css('.metric-label'));
      
      expect(userValue.nativeElement.textContent).toContain('1,234');
      expect(userLabel.nativeElement.textContent).toContain('Usuários Ativos');
    });

    it('should display product metrics', () => {
      const metrics = metricsCard.queryAll(By.css('.metric'));
      const productMetric = metrics[1];
      const productValue = productMetric.query(By.css('.metric-value'));
      const productLabel = productMetric.query(By.css('.metric-label'));
      
      expect(productValue.nativeElement.textContent).toContain('567');
      expect(productLabel.nativeElement.textContent).toContain('Produtos');
    });
  });

  describe('Pending Products Card', () => {
    let pendingCard: DebugElement;

    beforeEach(() => {
      pendingCard = fixture.debugElement.query(By.css('.admin-card:nth-child(2)'));
    });

    it('should display pending products title', () => {
      const title = pendingCard.query(By.css('h3'));
      expect(title.nativeElement.textContent).toContain('🛍️ Produtos Pendentes');
    });

    it('should display pending count', () => {
      const description = pendingCard.query(By.css('p'));
      expect(description.nativeElement.textContent).toContain('5 produtos aguardando aprovação');
    });

    it('should have review button', () => {
      const button = pendingCard.query(By.css('.btn-primary'));
      expect(button.nativeElement.textContent).toContain('Revisar Produtos');
    });
  });

  describe('Users Card', () => {
    let usersCard: DebugElement;

    beforeEach(() => {
      usersCard = fixture.debugElement.query(By.css('.admin-card:nth-child(3)'));
    });

    it('should display users title', () => {
      const title = usersCard.query(By.css('h3'));
      expect(title.nativeElement.textContent).toContain('👥 Usuários');
    });

    it('should display users description', () => {
      const description = usersCard.query(By.css('p'));
      expect(description.nativeElement.textContent).toContain('Gerencie usuários e permissões');
    });

    it('should have view users button', () => {
      const button = usersCard.query(By.css('.btn-secondary'));
      expect(button.nativeElement.textContent).toContain('Ver Usuários');
    });
  });

  describe('Settings Card', () => {
    let settingsCard: DebugElement;

    beforeEach(() => {
      settingsCard = fixture.debugElement.query(By.css('.admin-card:nth-child(4)'));
    });

    it('should display settings title', () => {
      const title = settingsCard.query(By.css('h3'));
      expect(title.nativeElement.textContent).toContain('⚙️ Configurações');
    });

    it('should display settings description', () => {
      const description = settingsCard.query(By.css('p'));
      expect(description.nativeElement.textContent).toContain('Configurações do sistema');
    });

    it('should have configure button', () => {
      const button = settingsCard.query(By.css('.btn-secondary'));
      expect(button.nativeElement.textContent).toContain('Configurar');
    });
  });

  describe('Button Styling', () => {
    it('should have primary button with correct styling', () => {
      const primaryBtn = fixture.debugElement.query(By.css('.btn-primary'));
      expect(primaryBtn).toBeTruthy();
      expect(primaryBtn.nativeElement.classList.contains('btn-primary')).toBeTruthy();
    });

    it('should have secondary buttons with correct styling', () => {
      const secondaryBtns = fixture.debugElement.queryAll(By.css('.btn-secondary'));
      expect(secondaryBtns.length).toBe(3);
      
      secondaryBtns.forEach(btn => {
        expect(btn.nativeElement.classList.contains('btn-secondary')).toBeTruthy();
      });
    });
  });

  describe('Layout Structure', () => {
    it('should have proper admin container', () => {
      const adminContainer = fixture.debugElement.query(By.css('.admin-container'));
      expect(adminContainer).toBeTruthy();
    });

    it('should have admin header', () => {
      const adminHeader = fixture.debugElement.query(By.css('.admin-header'));
      expect(adminHeader).toBeTruthy();
    });

    it('should have admin grid', () => {
      const adminGrid = fixture.debugElement.query(By.css('.admin-grid'));
      expect(adminGrid).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const adminGrid = fixture.debugElement.query(By.css('.admin-grid'));
      const gridElement = adminGrid.nativeElement;
      
      expect(gridElement.classList.contains('admin-grid')).toBeTruthy();
    });

    it('should have proper card structure', () => {
      const adminCards = fixture.debugElement.queryAll(By.css('.admin-card'));
      
      adminCards.forEach(card => {
        expect(card.nativeElement.classList.contains('admin-card')).toBeTruthy();
      });
    });
  });
}); 