import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCard } from '../../shared/components/base-card/base-card';
import { ICON_PATHS } from '../../core/constants/icon.constants';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule, TranslateModule, BaseCard],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.scss',
})
export class StatsCards {
  stats = [
    {
      id: 'average-time',
      icon: ICON_PATHS.clock,
      translationKey: 'statsCards.averageTime',
      value: '24 min'
    },
    {
      id: 'occupation',
      icon: ICON_PATHS.chart,
      translationKey: 'statsCards.occupation',
      value: '80%'
    },
    {
      id: 'deliveries',
      icon: ICON_PATHS.checkmark,
      translationKey: 'statsCards.deliveries',
      value: '17 Pdt.'
    }
  ];
}

