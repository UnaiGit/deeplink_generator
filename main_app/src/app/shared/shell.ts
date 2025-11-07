import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { TranslateModule } from '@ngx-translate/core';
import { ShellService, NavMode } from './../shared/services/shell';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { I18nService } from '../i18n/i18n.services';
import { environment } from '../../environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Sidebar, TranslateModule],
})
export class ShellComponent implements OnInit, OnDestroy {
  isSidebarActive = false;
  isSidebarExpanded = true;
  private _resizeHandler?: () => void;

  constructor(
    private readonly _shellService: ShellService,
    private readonly _router: Router,
    private readonly _i18n: I18nService,
  ) {}

  ngOnInit() {
    this._i18n.init(environment.defaultLanguage, environment.supportedLanguages);
    
    // Subscribe to nav mode changes to track sidebar state
    this._shellService.navMode$.pipe(untilDestroyed(this)).subscribe((mode) => {
      this.isSidebarExpanded = mode === NavMode.Free;
    });

    // Track explicit mobile sidebar visibility
    this._shellService.sidebarVisible$.pipe(untilDestroyed(this)).subscribe((visible) => {
      this.isSidebarActive = visible;
    });

    // Responsive: collapse sidebar at <=1340px, expand otherwise
    const applySidebarMode = () => {
      if (typeof window === 'undefined') return;
      const mode = window.innerWidth <= 1340 ? NavMode.Locked : NavMode.Free;
      this._shellService.setNavMode(mode);
    };
    applySidebarMode();
    this._resizeHandler = () => applySidebarMode();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._resizeHandler);
    }
  }

  sidebarToggle(toggleState: boolean) {
    this.isSidebarActive = toggleState;
  }

  private _reloadCurrentRoute(path?: string) {
    const currentUrl = path || this._router.url;
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }

  ngOnDestroy(): void {
    if (this._resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this._resizeHandler);
    }
  }

  // Exposed for template to close sidebar from backdrop
  closeMobileSidebar(): void {
    this._shellService.closeMobileSidebar();
  }
}
