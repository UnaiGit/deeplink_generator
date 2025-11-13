import { Injectable, signal } from '@angular/core';
import { ToastData, ToastType } from '../../components/toast/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastSignal = signal<ToastData | null>(null);
  private readonly visibleSignal = signal<boolean>(false);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  toast = this.toastSignal.asReadonly();
  visible = this.visibleSignal.asReadonly();

  show(message: string, type: ToastType = 'success', duration: number = 3000): void {
    // Clear any existing timer
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    const toast: ToastData = {
      id: Date.now().toString(),
      message,
      type,
      duration,
    };

    this.toastSignal.set(toast);
    this.visibleSignal.set(true);

    // Auto-hide after duration
    this.hideTimer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    this.visibleSignal.set(false);
    
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // Clear toast after animation
    setTimeout(() => {
      this.toastSignal.set(null);
    }, 300);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}

