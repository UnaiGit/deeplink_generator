import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { FloorTabs } from "./components/floor-tabs/floor-tabs";
import { StatusLegend } from "./components/status-legend/status-legend";
import { FloorType } from './components/Models/interface-legends';
import { FloorCanvas } from "./components/floor-canvas/floor-canvas";
import { Notifications } from "./components/notifications/notifications";
import { Notification } from "./components/notifications/notification.model";
import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';
import { ActionCards, ActionCardClickContext } from "./components/action-cards/action-cards";
import { StatsCards } from "./components/stats-cards/stats-cards";
import { Departments } from "./components/departments/departments";
import { Employees } from "./components/employees/employees";
import { Floors } from "./components/floors/floors";
import { Toast } from "./components/toast/toast";
import { ToastService } from "./core/services/toast.service";
import { ICON_PATHS } from './core/constants/icon.constants';

@Component({
  selector: 'app-root',
  imports: [FloorTabs, StatusLegend, FloorCanvas, Notifications, ActionCards, StatsCards, Departments, Employees, Floors, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  protected readonly toastService = inject(ToastService);
  
    selectedFloor = signal<FloorType | string>('main');
  protected readonly title = signal('panel_constructor');
  showDepartments = signal<boolean>(false);
  showNotifications = signal<boolean>(true); // Initially visible, then auto-hide
  showEmployees = signal<boolean>(false);
  employeesAnchor = signal<ActionCardClickContext | null>(null);
  showFloors = signal<boolean>(false);
  floorsAnchor = signal<ActionCardClickContext | null>(null);
  
  // Icon paths
  bellIcon = ICON_PATHS.bell;
  
  // Event listener reference for cleanup
  private notificationEventListener?: (event: Event) => void;
  
  // Store original notifications to restore when clicking bell icon
  private originalNotifications: Notification[] = [
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
  ];
  
  // Sample notifications data - using type only, translations will be applied in component
  notifications = signal<Notification[]>(this.originalNotifications);

  ngOnInit(): void {
    console.log('Panel Constructor: ngOnInit called');
    // Initialize i18n service
    this.i18nService.language = '';
    // Theme service is automatically initialized in constructor
    
    // Auto-dismiss notifications after 3 seconds on screen reload
    setTimeout(() => {
      console.log('Panel Constructor: Auto-dismissing notifications after 3 seconds');
      this.showNotifications.set(false);
      this.notifications.set([]);
    }, 3000);
    
    // Listen for notification events from main app header
    if (typeof window !== 'undefined') {
      console.log('Panel Constructor: Setting up showNotifications event listener');
      this.notificationEventListener = ((event: CustomEvent) => {
        console.log('Panel Constructor: showNotifications event received', event);
        // Run inside Angular zone to ensure change detection works
        this.ngZone.run(() => {
          // Toggle notifications visibility when main app header button is clicked
          const currentVisibility = this.showNotifications();
          console.log('Panel Constructor: Current visibility:', currentVisibility);
          if (currentVisibility) {
            // If currently visible, hide them
            console.log('Panel Constructor: Hiding notifications');
            this.showNotifications.set(false);
          } else {
            // If hidden, restore and show them
            console.log('Panel Constructor: Showing notifications');
            console.log('Panel Constructor: Original notifications:', this.originalNotifications);
            // Set notifications first
            this.notifications.set([...this.originalNotifications]);
            console.log('Panel Constructor: Notifications array set to:', this.notifications());
            console.log('Panel Constructor: Notifications count:', this.notifications().length);
            // Then show the component
            setTimeout(() => {
              this.showNotifications.set(true);
              console.log('Panel Constructor: showNotifications set to:', this.showNotifications());
              console.log('Panel Constructor: Template should now render notifications');
            }, 0);
          }
          console.log('Panel Constructor: Final state - showNotifications:', this.showNotifications(), 'notifications count:', this.notifications().length);
        });
      }) as EventListener;
      window.addEventListener('showNotifications', this.notificationEventListener);
      console.log('Panel Constructor: Event listener added successfully');
      
      // Test event listener after a short delay to verify it's working
      setTimeout(() => {
        console.log('Panel Constructor: Testing event listener...');
        const testEvent = new CustomEvent('showNotifications', {
          detail: { action: 'test' },
          bubbles: true
        });
        window.dispatchEvent(testEvent);
        console.log('Panel Constructor: Test event dispatched');
      }, 1000);
    } else {
      console.warn('Panel Constructor: window is undefined, cannot add event listener');
    }
    
    // Hide notifications when clicking anywhere on the screen
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      // Don't hide if clicking inside notifications container, bell button, or sidebar
      // Also don't hide if clicking the main app notification button
      if (!target.closest('.notifications-container') && 
          !target.closest('.notification-bell-button') &&
          !target.closest('.notifications-sidebar') &&
          !target.closest('.btn.ghost.badge')) {
        // Only hide if notifications are currently visible
        if (this.showNotifications()) {
          console.log('Panel Constructor: Click outside detected, hiding notifications');
          this.showNotifications.set(false);
        }
      }
    });
  }

   onFloorChange(floor: FloorType | string): void {
    this.selectedFloor.set(floor);
    console.log('Selected floor changed to:', floor);
  }

  onMuteClick(): void {
    console.log('Mute notifications for 10 minutes');
  }

  onBuildClick(): void {
    const currentlyOpen = this.showDepartments();
    console.log('Build button clicked - toggling departments', currentlyOpen);
    if (currentlyOpen) {
      this.showDepartments.set(false);
    } else {
      this.showEmployees.set(false);
      this.employeesAnchor.set(null);
      this.showFloors.set(false);
      this.floorsAnchor.set(null);
      this.showDepartments.set(true);
    }
  }

  onEmployeesClick(anchor: ActionCardClickContext): void {
    const currentlyOpen = this.showEmployees();
    console.log('Employees button clicked - toggling employees panel', currentlyOpen);
    if (currentlyOpen) {
      this.showEmployees.set(false);
      this.employeesAnchor.set(null);
    } else {
      this.showDepartments.set(false);
      this.showFloors.set(false);
      this.floorsAnchor.set(null);
      this.employeesAnchor.set(anchor);
      this.showEmployees.set(true);
    }
  }

  onFloorsClick(anchor: ActionCardClickContext): void {
    const currentlyOpen = this.showFloors();
    console.log('Floors button clicked - toggling floors panel', currentlyOpen);
    if (currentlyOpen) {
      this.showFloors.set(false);
      this.floorsAnchor.set(null);
    } else {
      this.showDepartments.set(false);
      this.showEmployees.set(false);
      this.employeesAnchor.set(null);
      this.floorsAnchor.set(anchor);
      this.showFloors.set(true);
    }
  }

  onCloseDepartments(): void {
    this.showDepartments.set(false);
  }

  onCloseEmployees(): void {
    this.showEmployees.set(false);
    this.employeesAnchor.set(null);
  }

  onCloseFloors(): void {
    this.showFloors.set(false);
    this.floorsAnchor.set(null);
  }

  onNotificationIconClick(): void {
    console.log('Panel Constructor: Local bell button clicked');
    // Toggle notifications visibility when clicking the bell icon
    const currentVisibility = this.showNotifications();
    console.log('Panel Constructor: Current visibility:', currentVisibility);
    if (currentVisibility) {
      // If currently visible, hide them
      console.log('Panel Constructor: Hiding notifications');
      this.showNotifications.set(false);
    } else {
      // If hidden, restore and show them
      console.log('Panel Constructor: Showing notifications');
      this.notifications.set([...this.originalNotifications]);
      this.showNotifications.set(true);
    }
    console.log('Panel Constructor: New visibility:', this.showNotifications());
  }

  ngOnDestroy(): void {
    // Clean up event listener to prevent memory leaks
    if (typeof window !== 'undefined' && this.notificationEventListener) {
      window.removeEventListener('showNotifications', this.notificationEventListener);
    }
  }
}
