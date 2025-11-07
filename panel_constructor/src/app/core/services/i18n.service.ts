import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { translations } from './translations';
import { APP_CONSTANTS } from '../constants';

const languageKey = 'language';
const defaultLanguage = 'de-DE';
const supportedLanguages = ['de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT'];

@Injectable({
  providedIn: 'root',
})
export class I18nService implements OnDestroy {
  private readonly _languageSubject: BehaviorSubject<string>;
  private _storageSubscription?: Subscription;
  private _langChangeSubscription?: Subscription;

  constructor(private readonly _translateService: TranslateService) {
    // Embed translations to avoid extra HTTP requests
    this._translateService.setTranslation('de-DE', translations['de-DE']);
    this._translateService.setTranslation('en-US', translations['en-US']);
    this._translateService.setTranslation('es-ES', translations['es-ES']);
    this._translateService.setTranslation('fr-FR', translations['fr-FR']);
    this._translateService.setTranslation('it-IT', translations['it-IT']);

    // Initialize with language from localStorage or default
    const initialLanguage = localStorage.getItem(languageKey) || defaultLanguage;
    this._languageSubject = new BehaviorSubject<string>(initialLanguage);

    // Set default language
    this._translateService.setDefaultLang(defaultLanguage);
    this._translateService.use(initialLanguage);

    // Listen to localStorage changes from main app
    this._setupStorageListener();

    // Listen to language changes and save to localStorage
    this._langChangeSubscription = this._translateService.onLangChange.subscribe((event) => {
      localStorage.setItem(languageKey, event.lang);
      this._languageSubject.next(event.lang);
    });
  }

  /**
   * Listen to localStorage changes to sync with main app
   */
  private _setupStorageListener(): void {
    // Listen to storage events (when main app changes language)
    this._storageSubscription = fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter((event) => event.key === languageKey && event.newValue !== null)
      )
      .subscribe((event) => {
        const newLanguage = event.newValue || defaultLanguage;
        if (this.supportedLanguages.includes(newLanguage)) {
          this._translateService.use(newLanguage);
          this._languageSubject.next(newLanguage);
        }
      });

    // Also check localStorage periodically (for same-window changes)
    setInterval(() => {
      const currentLang = localStorage.getItem(languageKey) || defaultLanguage;
      if (currentLang !== this._translateService.currentLang && this.supportedLanguages.includes(currentLang)) {
        this._translateService.use(currentLang);
        this._languageSubject.next(currentLang);
      }
    }, APP_CONSTANTS.SYNC.LANGUAGE_POLL_INTERVAL);
  }

  /**
   * Returns the current language as an observable.
   */
  get languageObservable(): Observable<string> {
    return this._languageSubject.asObservable();
  }

  /**
   * Gets the current language.
   */
  get language(): string {
    return this._translateService.currentLang || defaultLanguage;
  }

  /**
   * Sets the current language.
   */
  set language(language: string) {
    if (this.supportedLanguages.includes(language)) {
      this._translateService.use(language);
      localStorage.setItem(languageKey, language);
      this._languageSubject.next(language);
    }
  }

  get supportedLanguages(): string[] {
    return supportedLanguages;
  }

  get defaultLanguage(): string {
    return defaultLanguage;
  }

  ngOnDestroy(): void {
    if (this._storageSubscription) {
      this._storageSubscription.unsubscribe();
    }
    if (this._langChangeSubscription) {
      this._langChangeSubscription.unsubscribe();
    }
  }
}

