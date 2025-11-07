import { Component, OnInit, signal, inject } from '@angular/core';
import { FloorTabs } from "./components/floor-tabs/floor-tabs";
import { StatusLegend } from "./components/status-legend/status-legend";
import { FloorType } from './components/Models/interface-legends';
import { FloorCanvas } from "./components/floor-canvas/floor-canvas";
import { Notifications } from "./components/notifications/notifications";
import { Notification } from "./components/notifications/notification.model";
import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';
import { ActionCards } from "./components/action-cards/action-cards";
import { StatsCards } from "./components/stats-cards/stats-cards";

@Component({
  selector: 'app-root',
  imports: [FloorTabs, StatusLegend, FloorCanvas, Notifications, ActionCards, StatsCards],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private i18nService = inject(I18nService);
  private themeService = inject(ThemeService);
  
    selectedFloor = signal<FloorType>('main');
  protected readonly title = signal('panel_constructor');
  
  // Sample notifications data - using type only, translations will be applied in component
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'reserved'
    },
    {
      id: '2',
      type: 'kitchen'
    },
    {
      id: '3',
      type: 'payment'
    }
  ]);

  ngOnInit(): void {
    // Initialize i18n service
    this.i18nService.language = '';
    // Theme service is automatically initialized in constructor
  }

   onFloorChange(floor: FloorType): void {
    this.selectedFloor.set(floor);
    console.log('Selected floor changed to:', floor);
  }

  onMuteClick(): void {
    console.log('Mute notifications for 10 minutes');
  }
}
