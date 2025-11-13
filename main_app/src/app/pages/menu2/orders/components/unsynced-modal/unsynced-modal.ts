import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-unsynced-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './unsynced-modal.html',
  styleUrl: './unsynced-modal.scss',
})
export class UnsyncedModalComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() switch = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onSwitch(): void {
    this.switch.emit();
  }
}

