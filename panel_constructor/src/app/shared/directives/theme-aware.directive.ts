import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appThemeAware]',
  standalone: true,
})
export class ThemeAwareDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private themeService = inject(ThemeService);
  private subscription?: Subscription;

  ngOnInit(): void {
    // Apply initial theme class
    this.updateThemeClass();
    
    // Subscribe to theme changes
    this.subscription = this.themeService.theme$.subscribe(() => {
      this.updateThemeClass();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateThemeClass(): void {
    const element = this.elementRef.nativeElement;
    const isDark = this.themeService.isDarkMode;
    
    // Remove existing theme classes
    element.classList.remove('theme-light', 'theme-dark');
    
    // Add current theme class
    element.classList.add(isDark ? 'theme-dark' : 'theme-light');
  }
}

