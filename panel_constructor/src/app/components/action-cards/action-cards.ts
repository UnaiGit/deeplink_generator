import { Component, Signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCard } from '../../shared/components/base-card/base-card';
import { ActionCard } from '../../core/models/action-card.model';
import { ActionCardService } from '../../core/services/action-card.service';

export interface ActionCardClickContext {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-action-cards',
  imports: [CommonModule, TranslateModule, BaseCard],
  templateUrl: './action-cards.html',
  styleUrl: './action-cards.scss',
})
export class ActionCards {
  buildClick = output<void>();
  employeesClick = output<ActionCardClickContext>();
  floorsClick = output<ActionCardClickContext>();

  private readonly actionCardService = inject(ActionCardService);
  cards: Signal<ActionCard[]> = this.actionCardService.getActionCards();

  onCardClick(cardId: string, event: MouseEvent): void {
    switch (cardId) {
      case 'build':
        console.log('Build button is clicked');
        this.buildClick.emit();
        break;
      case 'employees':
        console.log('Employees button is clicked');
        this.employeesClick.emit(this.getClickContext(event));
        break;
      case 'floors':
        console.log('Floors button is clicked');
        this.floorsClick.emit(this.getClickContext(event));
        break;
      default:
        console.log(`Card ${cardId} clicked`);
        break;
    }
  }

  private getClickContext(event: MouseEvent): ActionCardClickContext {
    const target = (event.currentTarget as HTMLElement | null) ?? (event.target as HTMLElement | null);
    if (!target) {
      const fallbackWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      const fallbackHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
      return { x: fallbackWidth / 2, y: fallbackHeight / 2, width: 0, height: 0 };
    }
    const rect = target.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }
}

