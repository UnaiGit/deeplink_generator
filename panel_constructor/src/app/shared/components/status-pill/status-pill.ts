import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableStatus } from '../../../utils/table.model';

@Component({
  selector: 'app-status-pill',
  imports: [CommonModule, TranslateModule],
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.scss',
})
export class StatusPill {
  status = input.required<TableStatus>();
  size = input<'small' | 'medium' | 'large'>('medium');
}

