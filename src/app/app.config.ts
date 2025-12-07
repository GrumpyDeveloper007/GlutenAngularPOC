import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(HttpClientModule), provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  ]
};


@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) { }
}