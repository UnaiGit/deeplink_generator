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
  @Output() increment = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
}


