import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StatusItem } from '../Models/interface-legends';
import { TABLE_CONSTANTS } from '../../core/constants/table.constants';


@Component({
  selector: 'app-status-legend',
  imports: [TranslateModule],
  templateUrl: './status-legend.html',
  styleUrl: './status-legend.scss',
})
export class StatusLegend {
   statuses: { color: string; translationKey: string }[] = [
    { color: TABLE_CONSTANTS.STATUS_CONFIG.booked.backgroundColor, translationKey: 'status.reserved' }, // Blue - Reserved
    { color: TABLE_CONSTANTS.STATUS_CONFIG.free.backgroundColor, translationKey: 'status.available' }, // Teal - Available (#40C4AA)
    { color: TABLE_CONSTANTS.STATUS_CONFIG.noShow.backgroundColor, translationKey: 'status.noOrder' }, // Yellow - No order
    { color: TABLE_CONSTANTS.STATUS_CONFIG.occupied.backgroundColor, translationKey: 'status.occupied' }, // Red - Occupied
    { color: TABLE_CONSTANTS.STATUS_CONFIG.pendingPayment.backgroundColor, translationKey: 'status.payment' } // Magenta/Purple - Payment
  ];

}
