import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
})
export class ProductCardComponent implements OnChanges {
  @Input() title = '';
  @Input() price = 0;
  @Input() image = '';
  // Quantity coming from the store/parent. Keeps card in sync with cart
  @Input() currentQty = 0;
  @Output() add = new EventEmitter<number>();
  @Output() decrease = new EventEmitter<void>();
  @Output() zoom = new EventEmitter<void>();

  quantity = 0;
  isAdded = false;

  inc() {
    // Let parent/store handle quantity update; this component will sync via currentQty
    this.add.emit((this.quantity || 0) + 1);
  }
  
  dec() {
    // Do not mutate locally; ask parent to decrease
    this.decrease.emit();
  }

  onAdd() {
    this.add.emit(1);
  }

  onZoom() {
    this.zoom.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('currentQty' in changes) {
      const qty = this.currentQty || 0;
      this.quantity = qty;
      this.isAdded = qty > 0;
    }
  }
}

