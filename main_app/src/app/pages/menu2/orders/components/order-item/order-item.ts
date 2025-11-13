import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-item.html',
  styleUrls: ['./order-item.scss'],
})
export class OrderItemComponent {
  @Input() title = '';
  @Input() price = 0;
  @Input() image = '';
  @Input() quantity = 1;
  @Input() status: 'open' | 'locked' | 'delivered' | 'billing-only' | undefined = 'open';
  @Input() selected = false;
  @Input() clientName?: string;
  @Input() isLocked = false; // Disable editing when order is locked
  @Output() increment = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<boolean>();

  onCheckboxChange(checked: boolean): void {
    this.selectedChange.emit(checked);
  }

  getStatusText(): string {
    switch (this.status) {
      case 'locked':
        return 'Locked';
      case 'delivered':
        return 'Delivered';
      case 'billing-only':
        return 'Billing only change';
      case 'open':
        return 'Open';
      default:
        return 'Open';
    }
  }
}

