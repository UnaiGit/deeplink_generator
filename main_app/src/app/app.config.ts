import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CalendarModule, MOMENT } from 'angular-calendar';
import { SchedulerModule } from 'angular-calendar-scheduler';
import * as moment from 'moment';
import { of } from 'rxjs';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: MOMENT,
      useValue: moment,
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: () => ({
            getTranslation: (lang: string) => of({}),
          }),
        },
      }),
      CalendarModule,
      SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange' }),
    ),
  ]
};
