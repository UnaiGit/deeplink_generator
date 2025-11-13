import { Injectable, Signal, signal } from '@angular/core';
import { ActionCard } from '../models/action-card.model';
import { ICON_PATHS } from '../constants/icon.constants';

@Injectable({
  providedIn: 'root',
})
export class ActionCardService {
  private readonly actionCardsSignal = signal<ActionCard[]>([
    {
      id: 'build',
      icon: ICON_PATHS.builderBar,
      translationKey: 'actionCards.build',
      iconColor: '#3dc19a',
    },
    {
      id: 'employees',
      icon: ICON_PATHS.employees,
      translationKey: 'actionCards.employees',
      iconColor: '#3b82f6',
    },
    {
      id: 'floors',
      icon: ICON_PATHS.floors,
      translationKey: 'actionCards.floors',
      iconColor: '#fbbf24',
    },
    {
      id: 'reservations',
      icon: ICON_PATHS.reservations,
      translationKey: 'actionCards.reservations',
      iconColor: '#a855f7',
    },
  ]);

  getActionCards(): Signal<ActionCard[]> {
    return this.actionCardsSignal.asReadonly();
  }
}

