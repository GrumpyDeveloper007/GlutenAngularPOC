import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { bboxPolygon } from '@turf/bbox-polygon';
import { booleanIntersects } from '@turf/boolean-intersects';
import { centroid } from '@turf/centroid';
import { point } from '@turf/helpers';
import { MultiPolygon, Polygon } from 'geojson';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as L from 'leaflet';

interface CountryFeature {
    geometry: MultiPolygon | Polygon;
    properties: { Country: string };
}

interface StateFeature {
    geometry: MultiPolygon | Polygon;
    properties: { STATE: string };
}

interface GeoFeatureCollection<T> {
    features: T[];
}

@Injectable({ providedIn: 'root' })
export class MapDataService {
    private countriesGeoJSON: GeoFeatureCollection<CountryFeature> = { features: [] };
    private statesGeoJSON: GeoFeatureCollection<StateFeature> = { features: [] };
    private httpOptions = { headers: new HttpHeaders({}) };

    constructor(private http: HttpClient) { }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: unknown): Observable<T> => {
            console.error(error);
            return of(result as T);
        };
    }

    loadCountries(): Observable<GeoFeatureCollection<CountryFeature>> {
        return this.http.get<GeoFeatureCollection<CountryFeature>>("/World-EEZ.geo.json", this.httpOptions)
            .pipe(
                tap(data => this.countriesGeoJSON = data ?? { features: [] }),
                catchError(this.handleError<GeoFeatureCollection<CountryFeature>>('loadCountries', { features: [] })),
            );
    }

    loadStates(): Observable<GeoFeatureCollection<StateFeature>> {
        return this.http.get<GeoFeatureCollection<StateFeature>>("/statesSimplified.geo.json", this.httpOptions)
            .pipe(
                tap(data => this.statesGeoJSON = data ?? { features: [] }),
                catchError(this.handleError<GeoFeatureCollection<StateFeature>>('loadStates', { features: [] })),
            );
    }
    //http://leaflet-extras.github.io/leaflet-providers/preview/

    stadiaTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
        noWrap: true,
        minNativeZoom: 3,
        maxNativeZoom: 14,
        minZoom: 3,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    openTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    mapTilerTiles = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=4XNqZU5WGeN8rGGyXkiP`, { //style URL
        noWrap: true,
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
    });

    getCentrePointOfCountry(country: string): L.LatLng | null {
        const countryFeature = this.countriesGeoJSON.features.find(feature => feature.properties.Country === country);
        if (countryFeature) {
            const polygon = countryFeature.geometry as MultiPolygon;
            const centre = centroid(polygon);
            const coords = centre.geometry.coordinates; // [lng, lat]
            const latlng = new L.LatLng(coords[1], coords[0]);
            return latlng;
        }
        return null;
    }

    getCountriesInView(bounds: L.LatLngBounds): string[] {
        const southwest = bounds.getSouthWest();
        const northeast = bounds.getNorthEast();

        // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
        const countriesInView = this.countriesGeoJSON.features.filter(feature => {
            return booleanIntersects(feature.geometry as MultiPolygon,
                bboxPolygon([southwest.lng, southwest.lat, northeast.lng, northeast.lat]));
        });

        // Trigger api calls
        return countriesInView.map(feature => feature.properties.Country);
    }

    getCountriesInViewPoint(bounds: L.LatLng): string[] {

        // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
        const countriesInView = this.countriesGeoJSON.features.filter(feature => {
            return booleanIntersects(feature.geometry as MultiPolygon, point([bounds.lng, bounds.lat]));
        });

        // Trigger api calls
        return countriesInView.map(feature => feature.properties.Country);
    }

    getStatesInView(bounds: L.LatLngBounds): string[] {
        const southwest = bounds.getSouthWest();
        const northeast = bounds.getNorthEast();

        const statesInView = this.statesGeoJSON.features.filter(feature => {
            return booleanIntersects(feature.geometry as Polygon,
                bboxPolygon([southwest.lng, southwest.lat, northeast.lng, northeast.lat]));
        });

        // Trigger api calls
        return statesInView.map(feature => feature.properties.STATE as string);
    }
    getStatesInViewPoint(bounds: L.LatLng): string[] {

        // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
        const statesInView = this.statesGeoJSON.features.filter(feature => {
            return booleanIntersects(feature.geometry as Polygon, point([bounds.lng, bounds.lat]));
        });

        // Trigger api calls
        return statesInView.map(feature => feature.properties.STATE as string);
    }

}