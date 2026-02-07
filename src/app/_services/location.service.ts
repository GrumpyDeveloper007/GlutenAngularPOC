import { Injectable, Output } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class LocationService {
    constructor() { }

    @Output() locationLayer: L.LayerGroup = new L.LayerGroup();
    private watchId: number | null = null;


    getUserLocation(): Promise<{ latitude: number; longitude: number }> {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                reject(new Error('Geolocation is not supported by this browser.'));
            }
        });
    }


    setMapToUserLocation(): Promise<{ latitude: number; longitude: number }> {
        return new Promise((resolve, reject) => {
            this.getUserLocation()
                .then((loc) => {
                    var location = loc;
                    this.locationLayer.clearLayers();
                    L.circle([location.latitude, location.longitude], {
                        radius: 10,
                        color: 'blue',
                        fillColor: '#30f',
                        fillOpacity: 0.8
                    }).addTo(this.locationLayer);
                    resolve(loc);
                }
                )
                .catch((err) => {
                    console.debug(err);
                });
        });
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
                    this.locationLayer.clearLayers();
                    L.circle([position.coords.latitude, position.coords.longitude], {
                        radius: 10,
                        color: 'blue',
                        fillColor: '#30f',
                        fillOpacity: 0.8
                    }).addTo(this.locationLayer);

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