import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCard } from '../../shared/components/base-card/base-card';
import { ICON_PATHS } from '../../core/constants/icon.constants';

@Component({
  selector: 'app-action-cards',
  imports: [CommonModule, TranslateModule, BaseCard],
  templateUrl: './action-cards.html',
  styleUrl: './action-cards.scss',
})
export class ActionCards {
  buildClick = output<void>();

  cards = [
    {
      id: 'build',
      icon: ICON_PATHS.build,
      translationKey: 'actionCards.build',
      iconColor: '#3dc19a' // Teal/mint green
    },
    {
      id: 'employees',
      icon: ICON_PATHS.employees,
      translationKey: 'actionCards.employees',
      iconColor: '#3b82f6' // Blue
    },
    {
      id: 'floors',
      icon: ICON_PATHS.floors,
      translationKey: 'actionCards.floors',
      iconColor: '#fbbf24' // Yellow/orange
    },
    {
      id: 'reservations',
      icon: ICON_PATHS.reservations,
      translationKey: 'actionCards.reservations',
      iconColor: '#a855f7' // Purple/magenta
    }
  ];

  onCardClick(cardId: string): void {
    if (cardId === 'build') {
      console.log('Build button is clicked');
      this.buildClick.emit();
    }
  }
}

