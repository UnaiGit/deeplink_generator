import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Notification, NotificationType, NOTIFICATION_CONFIG } from './notification.model';
import { ICON_PATHS } from '../../core/constants/icon.constants';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, TranslateModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  notifications = input<Notification[]>([]);
  muteClick = output<void>();

  // Icon paths
  bellIcon = ICON_PATHS.bell;
  refreshIcon = ICON_PATHS.refresh;

  getNotificationConfig(type: NotificationType) {
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.general;
  }

  onMuteClick(): void {
    this.muteClick.emit();
  }
}

