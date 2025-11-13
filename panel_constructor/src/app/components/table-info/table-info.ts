import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableOrderSummary, TABLE_STATUS_CONFIG } from '../../utils/table.model';
import { BaseCard } from '../../shared/components/base-card/base-card';
import { StatusPill } from '../../shared/components/status-pill/status-pill';
import { ICON_PATHS } from '../../core/constants/icon.constants';

@Component({
  selector: 'app-table-info',
  imports: [CommonModule, TranslateModule, BaseCard, StatusPill],
  templateUrl: './table-info.html',
  styleUrl: './table-info.scss',
})
export class TableInfo {
  table = input<Table | null>(null);
  x = input<number>(0);
  y = input<number>(0);
  visible = input<boolean>(false);

  tableLabel = computed(() => this.table()?.label ?? 'Table');
  status = computed(() => this.table()?.status ?? 'free');
  tableShape = computed(() => this.table()?.shape ?? 'rectangular');
  department = computed(() => this.table()?.department ?? '');

  statusConfig = computed(() => TABLE_STATUS_CONFIG[this.status()] ?? TABLE_STATUS_CONFIG.free);

  chairsTotal = computed(() => this.table()?.seats ?? this.table()?.capacity ?? 0);
  chairsOccupied = computed(() => this.table()?.guestCount ?? this.table()?.occupiedChairs?.length ?? 0);
  occupancy = computed(() => {
    const seats = Math.max(0, this.chairsTotal());
    const occupied = Math.min(seats, Math.max(0, this.chairsOccupied()));
    const percentage = seats > 0 ? Math.round((occupied / seats) * 100) : 0;
    return { seats, occupied, percentage };
  });

  chairSummary = computed(() => this.occupancy());

  timeSeated = computed(() => this.formatDuration(this.table()?.timeSeatedMinutes));
  timeLimit = computed(() => this.formatDuration(this.table()?.maxStayMinutes));
  seatedSummary = computed(() => ({
    value: this.timeSeated(),
    limit: this.timeLimit(),
  }));

  serverName = computed(() => this.table()?.waiterName?.trim() || '—');
  runnerName = computed(() => this.table()?.runnerName?.trim() || '—');

  notes = computed(() => this.table()?.notes?.trim() ?? '');
  hasNotes = computed(() => !!this.notes());
  readyAtPass = computed(() => {
    const count = this.table()?.readyAtPassCount;
    if (count === undefined || count === null) {
      return null;
    }
    return {
      count,
      since: this.table()?.readyAtPassSinceLabel ?? null,
    };
  });
  paymentRequested = computed(() => this.table()?.paymentRequestedAgoLabel ?? null);

  startersDelivered = computed(() => this.getCourseMetric('starters', 'delivered'));
  startersTotal = computed(() => this.getCourseMetric('starters', 'total'));
  mainsPreparing = computed(() => this.getCourseMetric('mains', 'preparing'));
  mainsSent = computed(() => this.getCourseMetric('mains', 'sent'));
  mainsPending = computed(() => this.getCourseMetric('mains', 'pending'));
  nextEta = computed(() => this.getCourse('mains')?.eta ?? '—');
  drinksDelivered = computed(() => this.getCourseMetric('drinks', 'delivered'));
  drinksPending = computed(() => this.getCourseMetric('drinks', 'pending'));
  drinksPendingLocation = computed(() => this.getCourse('drinks')?.location ?? '—');

  readyAtPassCount = computed(() => this.readyAtPass()?.count ?? 0);
  readyAtPassTime = computed(() => this.readyAtPass()?.since ?? '—');
  paymentRequestedTime = computed(() => this.paymentRequested() ?? '—');

  bellIcon = ICON_PATHS.bell;
  cardIcon = ICON_PATHS.card;

  private formatDuration(minutes?: number | null): string | null {
    if (minutes === undefined || minutes === null) {
      return null;
    }
    const safeMinutes = Math.max(0, Math.floor(minutes));
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m`;
    }
    return `${mins}m`;
  }

  private getCourse(title: string): TableOrderSummary | null {
    const sections = this.table()?.orderSummary ?? [];
    const normalized = title.toLowerCase();
    return sections.find(section => section.title?.toLowerCase() === normalized) ?? null;
  }

  private getCourseMetric(
    title: string,
    key: keyof Pick<TableOrderSummary, 'delivered' | 'total' | 'preparing' | 'sent' | 'pending'>
  ): number {
    const course = this.getCourse(title);
    const value = course?.[key];
    if (value === undefined || value === null) {
      return 0;
    }
    return Math.max(0, value);
  }
}

