import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.scss']
})
export class MetricsDashboardComponent implements OnInit {
  loading = true;
  error = false;
  metrics: any = {};

  constructor(private supabaseService: SupabaseService) { }

  ngOnInit(): void {
    this.loadMetrics();
  }

  async loadMetrics() {
    try {
      this.metrics = await this.supabaseService.getDashboardMetrics();
    } catch (error) {
      this.error = true;
      console.error('Erro ao carregar métricas:', error);
    } finally {
      this.loading = false;
    }
  }
} 