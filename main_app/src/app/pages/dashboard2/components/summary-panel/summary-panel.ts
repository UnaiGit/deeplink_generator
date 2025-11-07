import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './summary-panel.html',
  styleUrls: ['./summary-panel.scss'],
})
export class SummaryPanelComponent {
  @Input() subTotal = 0;
  @Input() discount = 0.28; // placeholder
  @Input() tax = 0;
  @Input() total = 0;
}


