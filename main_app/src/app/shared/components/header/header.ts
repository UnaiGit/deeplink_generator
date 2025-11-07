import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelector } from '../../../i18n/language-selector';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ThemeService } from './../../../shared/services/theme';
import { ShellService } from '../../../shared/services/shell';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSelector, RouterLink],
})
export class Header {
  menuHidden = true;
  isFullscreen = false;
  isDarkMode = false;

  constructor(private themeService: ThemeService, private shellService: ShellService) {
    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', () => {
        this.isFullscreen = !!document.fullscreenElement;
      });
    }

    // Subscribe to theme changes
    this.themeService.theme$.pipe(untilDestroyed(this)).subscribe((theme) => {
      this.isDarkMode = theme === 'dark';
    });
  }

  toggleFullscreen(): void {
    if (typeof document === 'undefined') return;
    const isActive = !!document.fullscreenElement;
    if (!isActive) {
      const root = document.documentElement as any;
      const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen || root.mozRequestFullScreen;
      if (request) request.call(root);
    } else {
      const exit = (document as any).exitFullscreen || (document as any).webkitExitFullscreen || (document as any).msExitFullscreen || (document as any).mozCancelFullScreen;
      if (exit) exit.call(document);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.shellService.openMobileSidebar();
  }
}
