import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { I18nService } from './core/services/i18n.service';

import { routes } from './app.routes';

// Create a simple loader factory that uses embedded translations
export function createTranslateLoader() {
  return {
    getTranslation: (lang: string) => {
      // Return empty object - translations are loaded directly via setTranslation in I18nService
      // This loader is just to satisfy the TranslateService requirement
      return of({});
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'de-DE',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
        },
      }),
    ),
    I18nService
  ]
};
