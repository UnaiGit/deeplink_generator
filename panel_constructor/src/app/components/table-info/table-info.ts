import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableStatus } from '../../utils/table.model';
import { StatusPill } from '../../shared/components/status-pill/status-pill';
import { BaseCard } from '../../shared/components/base-card/base-card';
import { ICON_PATHS } from '../../core/constants/icon.constants';

@Component({
  selector: 'app-table-info',
  imports: [CommonModule, TranslateModule, StatusPill, BaseCard],
  templateUrl: './table-info.html',
  styleUrl: './table-info.scss',
})
export class TableInfo {
  // Inputs for table information
  tableId = input<string>('01');
  tableLabel = input<string>('Table 01');
  status = input<TableStatus>('occupied');
  
  // Table details
  chairsOccupied = input<number>(5);
  chairsTotal = input<number>(6);
  timeSeated = input<string>('00:42');
  timeLimit = input<string>('01:30');
  
  // Order progress
  startersDelivered = input<number>(4);
  startersTotal = input<number>(4);
  mainsPreparing = input<number>(2);
  mainsSent = input<number>(1);
  mainsPending = input<number>(1);
  nextEta = input<string>('06:10');
  drinksDelivered = input<number>(3);
  drinksPending = input<number>(1);
  drinksPendingLocation = input<string>('Bar');
  
  // Alerts
  readyAtPassCount = input<number>(2);
  readyAtPassTime = input<string>('01:05');
  paymentRequestedTime = input<string>('03:12');
  
  // Notes
  notes = input<string>('Gluten-free (Ana)');
  
  // Staff
  serverName = input<string>('Laura M');
  runnerName = input<string>('Pedro');
  
  // Position for tooltip
  x = input<number>(0);
  y = input<number>(0);
  visible = input<boolean>(false);
  
  // Icon paths
  bellIcon = ICON_PATHS.bell;
  cardIcon = ICON_PATHS.card;
}

