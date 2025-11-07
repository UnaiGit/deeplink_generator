import { Route, Router, Routes } from '@angular/router';

import { ShellComponent } from './../../shared/shell';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Provides helper methods to create routes.
 */
export class Shell {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: ShellComponent,
      children: routes,
      data: { reuse: true },
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class ShellService {
  navicon = new BehaviorSubject<NavMode>(NavMode.Free);
  navModeSubject = new BehaviorSubject<NavMode>(NavMode.Free);
  navMode$ = this.navModeSubject.asObservable();
  navicon$ = this.navModeSubject.asObservable();
  private sidebarVisibleSubject = new BehaviorSubject<boolean>(false);
  sidebarVisible$ = this.sidebarVisibleSubject.asObservable();

  constructor(
    private readonly _router: Router,
  ) {}

  // Basic access check placeholder to unblock templates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allowedAccess(_item: unknown): boolean {
    return true;
  }

  // No-op stubs to satisfy Sidebar interactions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activeNavTab(_items: unknown, _extendedIndex: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activateNavItem(_index: number, _items: unknown): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activateNavSubItem(_index: number, _subItem: unknown, _items: unknown): void {}

  toggleNavMode(): void {
    const mode = this.navModeSubject.getValue();
    this.navModeSubject.next(mode === NavMode.Free ? NavMode.Locked : NavMode.Free);
    this.navicon.next(mode === NavMode.Free ? NavMode.Locked : NavMode.Free);
  }

  /**
   * Explicitly set navigation mode (used for responsive breakpoints)
   */
  setNavMode(mode: NavMode): void {
    const current = this.navModeSubject.getValue();
    if (current !== mode) {
      this.navModeSubject.next(mode);
      this.navicon.next(mode);
    }
  }

  get currentNavMode(): NavMode {
    return this.navModeSubject.getValue();
  }

  openSidebar(): void {
    this.sidebarVisibleSubject.next(true);
  }

  closeSidebar(): void {
    this.sidebarVisibleSubject.next(false);
  }

  toggleSidebarVisible(): void {
    const v = this.sidebarVisibleSubject.getValue();
    this.sidebarVisibleSubject.next(!v);
  }

  // Helpers for mobile behavior: open expanded, close collapsed
  openMobileSidebar(): void {
    this.setNavMode(NavMode.Free);
    this.openSidebar();
  }

  closeMobileSidebar(): void {
    this.closeSidebar();
    this.setNavMode(NavMode.Locked);
  }

}

export enum NavMode {
  Locked,
  Free,
}
