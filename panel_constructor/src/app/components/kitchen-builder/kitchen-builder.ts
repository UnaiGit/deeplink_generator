import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitchenItem } from '../../core/interfaces/kitchen.interface';
import { ActionCardClickContext } from '../action-cards/action-cards';

@Component({
  selector: 'app-kitchen-builder',
  imports: [CommonModule],
  templateUrl: './kitchen-builder.html',
  styleUrl: './kitchen-builder.scss',
})
export class KitchenBuilder {
  isOpen = input<boolean>(false);
  items = input<KitchenItem[]>([]);
  anchor = input<ActionCardClickContext | null>(null);

  close = output<void>();
  save = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }
}

