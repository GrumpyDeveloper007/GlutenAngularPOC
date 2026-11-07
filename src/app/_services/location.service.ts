import { Injectable, NgZone, Output } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class LocationService {
    constructor(private ngZone: NgZone) { }

    @Output() locationLayer: L.LayerGroup = new L.LayerGroup();
    private watchId: number | null = null;


    getUserLocation(highAccuracy = false): Promise<{ latitude: number; longitude: number }> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            const options: PositionOptions = highAccuracy
                ? { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
                : { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.ngZone.run(() => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    });
                },
                (error) => {
                    this.ngZone.run(() => {
                        reject(error);
                    });
                },
                options
            );
        });
    }


    setMapToUserLocation(highAccuracy = false): Promise<{ latitude: number; longitude: number }> {
        return this.getUserLocation(highAccuracy)
            .then((loc) => {
                this.showLocationMarker(loc.latitude, loc.longitude);
                return loc;
            });
    }

    showLocationMarker(latitude: number, longitude: number): void {
        this.locationLayer.clearLayers();
        L.circle([latitude, longitude], {
            radius: 10,
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.8
        }).addTo(this.locationLayer);
    }

    // Start watching location updates
    startLocationWatching(): void {
        if (this.watchId) {
            this.stopLocationWatching();
        }

        if (navigator.geolocation) {
            const defaultOptions: PositionOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000, // 30 seconds
            };

            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.showLocationMarker(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error('Location watching error:', error);
                },
                defaultOptions
            );
        }
    }

    // Stop watching location updates
    stopLocationWatching(): void {
        if (this.watchId && navigator.geolocation) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
}