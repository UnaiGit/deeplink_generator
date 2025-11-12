import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Table } from '../../utils/table.model';

export interface TableConfigFormData {
  width: number;
  height: number;
  capacity: number;
  maxStay: string;
}

export interface NfcState {
  read: boolean;
  write: boolean;
  test: boolean;
}

@Component({
  selector: 'app-table-config-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './table-config-panel.html',
  styleUrls: ['./table-config-panel.scss'],
})
export class TableConfigPanel {
  @Input() table: Table | null = null;
  @Input() step: 'details' | 'nfc' = 'details';
  @Input() configData!: TableConfigFormData;
  @Input() gridSizeOptions: number[] = [];
  @Input() capacityRange!: { min: number; max: number };
  @Input() nfcState!: NfcState;
  @Input() isNfcComplete = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() configChange = new EventEmitter<void>();
  @Output() continueToNfc = new EventEmitter<void>();
  @Output() backToDetails = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() readUid = new EventEmitter<void>();
  @Output() writePayload = new EventEmitter<void>();
  @Output() testTap = new EventEmitter<void>();

  get isDetailsStep(): boolean {
    return this.step === 'details';
  }

  get isNfcStep(): boolean {
    return this.step === 'nfc';
  }
}

