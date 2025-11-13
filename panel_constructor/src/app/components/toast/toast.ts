import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  toast = input<ToastData | null>(null);
  visible = input<boolean>(false);

  getIconPath(): string {
    const type = this.toast()?.type || 'success';
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getIconViewBox(): string {
    return '0 0 24 24';
  }

  getBackgroundColor(): string {
    const type = this.toast()?.type || 'success';
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'info':
        return '#eff6ff';
      default:
        return '#f0fdf4';
    }
  }

  getBorderColor(): string {
    const type = this.toast()?.type || 'success';
    switch (type) {
      case 'success':
        return '#86efac';
      case 'error':
        return '#fca5a5';
      case 'warning':
        return '#fde047';
      case 'info':
        return '#93c5fd';
      default:
        return '#86efac';
    }
  }

  getIconColor(): string {
    const type = this.toast()?.type || 'success';
    switch (type) {
      case 'success':
        return '#16a34a';
      case 'error':
        return '#dc2626';
      case 'warning':
        return '#ca8a04';
      case 'info':
        return '#2563eb';
      default:
        return '#16a34a';
    }
  }
}

