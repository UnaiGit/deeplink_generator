import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface TableItem {
  id: string | number;
  number: string | number;
  clients: number;
  status?: 'locked' | 'pending' | 'active' | 'default';
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'default';
}

@Component({
  selector: 'app-tablelist',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tablelist.html',
  styleUrl: './tablelist.scss',
})
export class Tablelist {
  @Input() tables: TableItem[] = [];
  @Input() activeTable: string | number = '';
  @Output() tableSelected = new EventEmitter<string | number>();

  selectTable(tableId: string | number) {
    // Don't update local state, let parent handle it
    // This ensures the active state is controlled by parent
    this.tableSelected.emit(tableId);
  }

  getTableColor(table: TableItem): string {
    if (table.color) {
      return table.color;
    }
    // Default color based on status
    if (table.status === 'locked') return 'blue';
    if (table.status === 'pending') return 'pink';
    return 'default';
  }

  getTableIcon(table: TableItem): string | null {
    if (table.icon) return table.icon;
    if (table.status === 'locked') return '/icons/lock.svg';
    if (table.status === 'pending') return '/icons/history.svg';
    return null;
  }
}
