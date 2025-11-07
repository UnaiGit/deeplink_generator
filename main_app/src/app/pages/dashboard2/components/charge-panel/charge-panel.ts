import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charge-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charge-panel.html',
  styleUrls: ['./charge-panel.scss'],
})
export class ChargePanelComponent {
  @Input() open = false;
  @Input() subTotal = 0;
  @Input() discount = 0.28; // placeholder
  @Input() tax = 0;
  @Input() total = 0;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}


