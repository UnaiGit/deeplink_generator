import { Injectable, Signal, signal } from '@angular/core';
import { StatsCard } from '../models/stats-card.model';
import { ICON_PATHS } from '../constants/icon.constants';

@Injectable({
  providedIn: 'root',
})
export class StatsCardService {
  private readonly statsCardsSignal = signal<StatsCard[]>([
    {
      id: 'average-time',
      icon: ICON_PATHS.clock,
      translationKey: 'statsCards.averageTime',
      value: '24 min',
    },
    {
      id: 'occupation',
      icon: ICON_PATHS.chart,
      translationKey: 'statsCards.occupation',
      value: '80%',
    },
    {
      id: 'deliveries',
      icon: ICON_PATHS.checkmark,
      translationKey: 'statsCards.deliveries',
      value: '17 Pdt.',
    },
  ]);

  getStatsCards(): Signal<StatsCard[]> {
    return this.statsCardsSignal.asReadonly();
  }
}

