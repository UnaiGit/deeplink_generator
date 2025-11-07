import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StatusItem } from '../Models/interface-legends';


@Component({
  selector: 'app-status-legend',
  imports: [TranslateModule],
  templateUrl: './status-legend.html',
  styleUrl: './status-legend.scss',
})
export class StatusLegend {
   statuses: { color: string; translationKey: string }[] = [
    { color: '#10b981', translationKey: 'status.available' }, // Green
    { color: '#fbbf24', translationKey: 'status.reserved' }, // Yellow
    { color: '#ef4444', translationKey: 'status.occupied' }, // Red
    { color: '#f97316', translationKey: 'status.payment' }, // Orange
    { color: '#6b7280', translationKey: 'status.unsynced' } // Grey
  ];

}
