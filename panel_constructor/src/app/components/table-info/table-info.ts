import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableStatus } from '../../utils/table.model';
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
  // Accept table object directly
  table = input<Table | null>(null);
  
  // Position for tooltip
  x = input<number>(0);
  y = input<number>(0);
  visible = input<boolean>(false);
  
  // Computed values from table
  tableLabel = computed(() => this.table()?.label || 'Table 01');
  status = computed(() => this.table()?.status || 'available');
  chairsTotal = computed(() => this.table()?.seats || 0);
  chairsOccupied = computed(() => this.table()?.occupiedChairs?.length || 0);
  tableShape = computed(() => this.table()?.shape || 'rectangular');
  department = computed(() => this.table()?.department);
  
  // Sample data (can be replaced with real data from API)
  timeSeated = input<string>('00:42');
  timeLimit = input<string>('01:30');
  startersDelivered = input<number>(4);
  startersTotal = input<number>(4);
  mainsPreparing = input<number>(2);
  mainsSent = input<number>(1);
  mainsPending = input<number>(1);
  nextEta = input<string>('06:10');
  drinksDelivered = input<number>(3);
  drinksPending = input<number>(1);
  drinksPendingLocation = input<string>('Bar');
  readyAtPassCount = input<number>(2);
  readyAtPassTime = input<string>('01:05');
  paymentRequestedTime = input<string>('03:12');
  notes = input<string>('Gluten-free (Ana)');
  serverName = input<string>('Laura M');
  runnerName = input<string>('Pedro');
  
  // Icon paths
  bellIcon = ICON_PATHS.bell;
  cardIcon = ICON_PATHS.card;
}

