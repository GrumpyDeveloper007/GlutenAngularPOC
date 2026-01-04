import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var gtag: any;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

    trackEvent(eventName: string, eventDetails: string, eventCategory: string) {
        if (!environment.preview && typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': eventCategory,
                'event_label': eventName,
                'value': eventDetails
            });
        }
    }
}