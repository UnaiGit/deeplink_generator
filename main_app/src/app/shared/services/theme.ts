import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

/* The ThemeService class provides methods to set light and dark theme colors by updating
CSS variables in the document root element. */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly _themeSubject: BehaviorSubject<Theme>;

  private readonly _lightThemeColors: { [key: string]: string } = {
    // Primary theme colors
    '--orange': '#E9380B',
    '--yellow': '#FBC52D',
    '--dark-charcoal': '#333843',
    '--deep-gray': '#393B3D',
    '--slate-gray': '#667085',
    '--surface-1': '#FAFAFA',
    '--text-color-light': '#ffffff',
    '--text-color-medium': '#667085',
    '--text-color-dark': '#333843',
    '--sidebar-bg': '#ffffff',
    '--header-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--border-color': '#eef2f7',
    '--search-bg': '#f8fafc',
    '--input-bg': '#ffffff',
    '--shadow-color': 'rgba(15, 23, 42, 0.04)',
    '--icon-filter': 'none',
    // Grayscale
    '--white': '#fff',
    '--gray': '#e1e3e6',
    '--gray-50': '#f9fafb',
    '--gray-100': '#f8f9fa',
    '--gray-150': '#f1f3f4',
    '--gray-200': '#e9ecef',
    '--gray-300': '#dee2e6',
    '--gray-400': '#ced4da',
    '--gray-500': '#adb5bd',
    '--gray-600': '#868e96',
    '--gray-700': '#495057',
    '--gray-800': '#343a40',
    '--gray-900': '#212529',
    '--black': '#000',
    '--minor-gray': '#f2f2f5',
  };

  private readonly _darkThemeColors: { [key: string]: string } = {
    // Adjusted primary theme colors for dark theme
    '--orange': '#ff6b35',
    '--yellow': '#ffd23f',
    '--dark-charcoal': '#e0e0e0',
    '--deep-gray': '#b0b0b0',
    '--slate-gray': '#9ca3af',
    '--surface-1': '#111827',
    '--text-color-light': '#1f2937',
    '--text-color-medium': '#9ca3af',
    '--text-color-dark': '#f3f4f6',
    '--sidebar-bg': '#1f2937',
    '--header-bg': '#1f2937',
    '--card-bg': '#1f2937',
    '--border-color': '#374151',
    '--search-bg': '#374151',
    '--input-bg': '#374151',
    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    '--icon-filter': 'brightness(0) invert(1)',
    // Inverted Grayscale for Dark Theme
    '--white': '#1f2937',
    '--gray': '#4b5563',
    '--gray-50': '#3d4651',
    '--gray-100': '#374151',
    '--gray-150': '#2d3748',
    '--gray-200': '#4b5563',
    '--gray-300': '#6b7280',
    '--gray-400': '#9ca3af',
    '--gray-500': '#d1d5db',
    '--gray-600': '#e5e7eb',
    '--gray-700': '#f3f4f6',
    '--gray-800': '#f9fafb',
    '--gray-900': '#ffffff',
    '--black': '#f9fafb',
    '--minor-gray': '#374151',
  };

  constructor() {
    // Initialize with stored theme or default to light
    const storedTheme = this.getStoredTheme();
    this._themeSubject = new BehaviorSubject<Theme>(storedTheme);
    this.applyTheme(storedTheme);
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
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.storeTheme(theme);
    this._themeSubject.next(theme);
  }

  /**
   * Set light theme
   */
  setLightTheme(): void {
    this.setTheme('light');
  }

  /**
   * Set dark theme
   */
  setDarkTheme(): void {
    this.setTheme('dark');
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
  }

  /**
   * Apply CSS variables to document root
   */
  private _setTheme(colors: Record<string, string>): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    Object.keys(colors).forEach((key) => {
      root.style.setProperty(key, colors[key]);
    });
  }

  /**
   * Get stored theme from localStorage
   */
  private getStoredTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'light';

    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    return 'light';
  }

  /**
   * Store theme preference in localStorage
   */
  private storeTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }
}
