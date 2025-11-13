import { Component, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCard } from '../../shared/components/base-card/base-card';
import { StatsCard } from '../../core/models/stats-card.model';
import { StatsCardService } from '../../core/services/stats-card.service';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule, TranslateModule, BaseCard],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.scss',
})
export class StatsCards {
  private readonly statsCardService = inject(StatsCardService);
  stats: Signal<StatsCard[]> = this.statsCardService.getStatsCards();
}

