import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { THEME_CONSTANTS, APP_CONSTANTS } from '../constants';

export type Theme = 'light' | 'dark';

const THEME_KEY = THEME_CONSTANTS.STORAGE_KEY;
const defaultTheme: Theme = THEME_CONSTANTS.DEFAULT_THEME;

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private readonly _themeSubject: BehaviorSubject<Theme>;
  private _storageSubscription?: Subscription;
  private _pollInterval?: number;

  private readonly _lightThemeColors: { [key: string]: string } = THEME_CONSTANTS.LIGHT_THEME;
  private readonly _darkThemeColors: { [key: string]: string } = THEME_CONSTANTS.DARK_THEME;

  constructor() {
    // Initialize with stored theme or default
    const initialTheme = this.getStoredTheme();
    this._themeSubject = new BehaviorSubject<Theme>(initialTheme);
    this.applyTheme(initialTheme);

    // Listen to localStorage changes from parent app
    this._setupStorageListener();
    
    // Immediate check for theme changes (for same-window sync)
    this._checkThemeImmediately();
    
    // Also listen for custom theme change events (if parent app dispatches them)
    this._setupCustomEventListener();
  }

  /**
   * Check theme immediately (for same-window changes)
   */
  private _checkThemeImmediately(): void {
    const currentStorageTheme = localStorage.getItem(THEME_KEY);
    if (currentStorageTheme === 'light' || currentStorageTheme === 'dark') {
      const theme = currentStorageTheme as Theme;
      if (theme !== this._themeSubject.value) {
        this.applyTheme(theme);
        this._themeSubject.next(theme);
      }
    }
  }

  /**
   * Listen for custom theme change events (if parent app dispatches them)
   */
  private _setupCustomEventListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('themechange', ((event: CustomEvent) => {
        if (event.detail && (event.detail === 'light' || event.detail === 'dark')) {
          this.applyTheme(event.detail as Theme);
          this._themeSubject.next(event.detail as Theme);
        }
      }) as EventListener);
    }
  }

  /**
   * Listen to localStorage changes to sync with parent app
   */
  private _setupStorageListener(): void {
    // Listen to storage events (from other tabs/windows)
    this._storageSubscription = fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter((event) => event.key === THEME_KEY && event.newValue !== null),
      )
      .subscribe((event) => {
        if (event.newValue === 'light' || event.newValue === 'dark') {
          this.applyTheme(event.newValue as Theme);
          this._themeSubject.next(event.newValue as Theme);
        }
      });

    // Use a more frequent polling interval for immediate sync
    // Reduced from 500ms to 100ms for faster response
    const pollInterval = 100;
    this._pollInterval = window.setInterval(() => {
      const currentStorageTheme = localStorage.getItem(THEME_KEY);
      if (currentStorageTheme === 'light' || currentStorageTheme === 'dark') {
        const theme = currentStorageTheme as Theme;
        if (theme !== this._themeSubject.value) {
          this.applyTheme(theme);
          this._themeSubject.next(theme);
        }
      }
    }, pollInterval);
  }

  /**
   * Get the current theme as an observable
   */
  get theme$(): Observable<Theme> {
    return this._themeSubject.asObservable();
  }

  /**
   * Get the current theme value
   */
  get currentTheme(): Theme {
    return this._themeSubject.value;
  }

  /**
   * Check if dark mode is currently active
   */
  get isDarkMode(): boolean {
    return this._themeSubject.value === 'dark';
  }

  /**
   * Get current theme color by CSS variable name
   * This provides immediate access to theme colors without waiting for CSS variable updates
   */
  getThemeColor(cssVariable: string): string | undefined {
    const colors = this.isDarkMode ? this._darkThemeColors : this._lightThemeColors;
    return colors[cssVariable];
  }

  /**
   * Apply theme colors to document root
   */
  private applyTheme(theme: Theme): void {
    const colors = theme === 'dark' ? this._darkThemeColors : this._lightThemeColors;
    this._setTheme(colors);

    // Add data attribute to body for additional styling hooks
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Force a reflow to ensure CSS variables are applied immediately
    if (typeof document !== 'undefined') {
      document.documentElement.offsetHeight; // Force reflow
    }
  }

  /**
   * Apply CSS variables to document root
   */
  private _setTheme(colors: Record<string, string>): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    // Apply all CSS variables in a single batch for better performance
    Object.keys(colors).forEach((key) => {
      root.style.setProperty(key, colors[key]);
    });
    
    // Force immediate style recalculation
    void root.offsetHeight;
  }

  /**
   * Get stored theme from localStorage
   */
  private getStoredTheme(): Theme {
    if (typeof localStorage === 'undefined') return defaultTheme;

    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    return defaultTheme;
  }

  ngOnDestroy(): void {
    if (this._storageSubscription) {
      this._storageSubscription.unsubscribe();
    }
    if (this._pollInterval) {
      window.clearInterval(this._pollInterval);
    }
  }
}

