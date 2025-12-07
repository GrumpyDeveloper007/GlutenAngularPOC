import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorHandler, Injectable, inject } from '@angular/core';
class MyErrorHandler implements ErrorHandler {
  private http = inject(HttpClient);

  constructor() { }
  handleError(error: any) {
    this.http.post('https://thedevshire.azurewebsites.net/api/log', { message: error }).subscribe(
      response => {
        console.log(response);
      },
      error => {
        console.error(error);
      });
    console.error(error);
  }
}


export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(HttpClientModule), provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes, withComponentInputBinding()), provideAnimationsAsync(),
  { provide: ErrorHandler, useClass: MyErrorHandler }
  ]
};


@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) { }
}