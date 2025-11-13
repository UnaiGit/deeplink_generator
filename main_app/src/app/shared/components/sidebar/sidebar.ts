import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { NavMode, ShellService } from '../../services/shell';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgStyle,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
  ],
})
export class Sidebar implements OnInit {
  // Minimal local interface to avoid external dependency on @core/interfaces
  sidebarItems: Array<{
    title: string;
    icon?: string;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    divider?: boolean;
    subItems?: Array<{
      title: string;
      href?: string;
      active?: boolean;
      disabled?: boolean;
    }>;
  }> = [];
  sidebarExtendedItem = -1;
  navExpanded = true;

  constructor(
    private readonly _router: Router,
    public shellService: ShellService,
  ) {
    // Sidebar items provided by user
    this.sidebarItems = [
      {  title: 'Home', divider: false, disabled: true },
      { href: '/dashboard', title: 'Dashboard', active: false, icon: '/icons/dashboard.svg' },
      { href: '/dashboard2', title: 'Waiter panel ', active: false, icon: '/icons/dashboard.svg' },
      { href: '/market', title: 'Market', active: false, icon: '/icons/market.svg', disabled: true },
      { href: '/analytics', title: 'Analytics', active: false, icon: '/icons/analytics.svg' },
      { href: '/feedback', title: 'Feedback', active: false, icon: '/icons/feedback.svg', disabled: true },
      { href: '/reservations', title: 'Reservations', active: false, icon: '/icons/reservation.svg', disabled: true },
      { href: '/occupation', title: 'Occupation', active: false, icon: '/icons/occupation.svg', disabled: true },
      {  title: 'Orders', divider: false, disabled: true },
      {
        href: '',
        title: 'Menu',
        active: false,
        icon: '/icons/menu.svg',
        subItems: [
          { href: '/menu2', title: 'Editor Menu', active: false },
          { href: '/employees', title: 'Employees', active: false },
          { href: '/orders', title: 'Orders', active: false },
        ],
      },
      {
        href: '/menu',
        title: 'Constructor',
        active: false,
        icon: '/icons/menu.svg',
        // subItems: [
        //   { href: '/menu/all', title: 'All', active: false },
        //   { href: '/menu/new', title: 'New', active: false },
        // ],
      },
      {
        href: '/categories',
        title: 'Categories',
        active: false,
        icon: '/icons/categorey.svg',
        disabled: true,
        subItems: [
          { href: '/categories/food', title: 'Food', active: false, disabled: true },
          { href: '/categories/drinks', title: 'Drinks', active: false, disabled: true },
        ],
      },
      { href: '/dishes', title: 'Dishes', active: false, icon: '/icons/dishes.svg', disabled: false },
    ];
  }

  ngOnInit(): void {
    this.updateActiveState();
    this.shellService.activeNavTab(this.sidebarItems, this.sidebarExtendedItem);

    this._router.events
      .pipe(untilDestroyed(this))
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveState();
        this.shellService.activeNavTab(this.sidebarItems, this.sidebarExtendedItem);
      });

    this.shellService.navMode$.pipe(untilDestroyed(this)).subscribe((mode) => {
      /**
       * Change the second condition to mode === NavMode.Locked to make navbar by default collapsed
       */
      this.navExpanded = mode === NavMode.Free;
    });
  }

  private updateActiveState(): void {
    const currentUrl = this._router.url.split('?')[0]; // Remove query params
    
    // First, find all potential matches
    interface Match {
      itemIndex: number;
      subItemIndex?: number;
      priority: number;
      href: string;
    }
    const matches: Match[] = [];
    
    this.sidebarItems.forEach((item, index) => {
      if (item.href && !item.divider) {
        // Exact match has highest priority
        if (currentUrl === item.href) {
          matches.push({ itemIndex: index, priority: 2, href: item.href });
        }
        // Prefix match (but not exact) has lower priority
        else if (currentUrl.startsWith(item.href + '/')) {
          matches.push({ itemIndex: index, priority: 1, href: item.href });
        }
      }
      
      // Check subItems
      if (item.subItems) {
        item.subItems.forEach((subItem, subIndex) => {
          if (subItem.href) {
            if (currentUrl === subItem.href) {
              matches.push({ itemIndex: index, subItemIndex: subIndex, priority: 2, href: subItem.href });
            } else if (currentUrl.startsWith(subItem.href + '/')) {
              matches.push({ itemIndex: index, subItemIndex: subIndex, priority: 1, href: subItem.href });
            }
          }
        });
      }
    });
    
    // Sort by priority (highest first) and then by href length (longest first) for prefix matches
    matches.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return b.href.length - a.href.length;
    });
    
    // Reset all items to inactive
    this.sidebarItems.forEach((item) => {
      item.active = false;
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          subItem.active = false;
        });
      }
    });
    
    // Activate the best match (first in sorted array)
    if (matches.length > 0) {
      const bestMatch = matches[0];
      const item = this.sidebarItems[bestMatch.itemIndex];
      
      if (bestMatch.subItemIndex !== undefined && item.subItems) {
        // If a subItem matched, activate both the parent and the subItem
        item.active = true;
        item.subItems[bestMatch.subItemIndex].active = true;
      } else {
        // If only the parent item matched, activate just the parent
        item.active = true;
      }
    }
  }

  toggleSidebar(): void {
    this.shellService.toggleNavMode();
  }

  activateSidebarItem(index: number): void {
    const item = this.sidebarItems[index];
    if (item.disabled) return;

    if (index !== this.sidebarExtendedItem) {
      this.sidebarExtendedItem = index;
    } else {
      this.sidebarExtendedItem = -1; // Toggle the same item
    }

    this.shellService.activateNavItem(index, this.sidebarItems);

    // Close mobile sidebar after selecting a link
    if (typeof window !== 'undefined' && window.innerWidth <= 1340) {
      this.shellService.closeMobileSidebar();
    }
  }

  activateSidebarSubItem(index: number, subItem: { title: string }): void {
    this.shellService.activateNavSubItem(index, subItem, this.sidebarItems);
    if (typeof window !== 'undefined' && window.innerWidth <= 1340) {
      this.shellService.closeMobileSidebar();
    }
  }
}
