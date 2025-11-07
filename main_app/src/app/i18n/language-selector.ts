import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nService } from './i18n.services';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss',
})
export class LanguageSelector {
  @Input() inNavbar: boolean = false;
  supported = environment.supportedLanguages;

  isOpen = false;

  constructor(public translate: TranslateService, private i18n: I18nService, private el: ElementRef<HTMLElement>) {}

  change(lang: string) {
    this.i18n.language = lang;
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }
}
