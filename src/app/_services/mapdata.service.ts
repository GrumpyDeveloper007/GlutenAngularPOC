import { Injectable } from '@angular/core';
import * as maplibre from 'maplibre-gl';
import * as turf from "@turf/turf";
import { MultiPolygon, Polygon, Position } from 'geojson';
import * as L from 'leaflet';

//import countriesGeoJSON2 from '../staticdata/countries.geo.json';
import countriesGeoJSON2 from '../staticdata/World-EEZ.geo.json';
import statesGeoJSON2 from '../staticdata/statesSimplified.geo.json';

@Injectable({ providedIn: 'root' })
export class MapDataService {
    constructor() { }
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

    getCentrePointOfCountry(country: string): L.LatLngExpression | null {
        const countryFeature = countriesGeoJSON2.features.find(feature => feature.properties.Country === country);
        if (countryFeature) {
            const polygon = countryFeature.geometry as MultiPolygon;
            const centre = turf.centroid(polygon);
            const coords = centre.geometry.coordinates; // [lng, lat]
            const latlng: L.LatLngExpression = [coords[1], coords[0]];
            return latlng;
        }
        return null;
    }

    getCountriesInView(bounds: maplibre.LngLatBounds | any): string[] {
        const southwest = bounds.getSouthWest();
        const northeast = bounds.getNorthEast();

        // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
        const countriesInView = countriesGeoJSON2.features.filter(feature => {
            return turf.booleanIntersects(feature.geometry as MultiPolygon,
                turf.bboxPolygon([southwest.lng, southwest.lat, northeast.lng, northeast.lat]));
        });

        // Trigger api calls
        return countriesInView.map(feature => feature.properties.Country);
    }

    getCountriesInViewPoint(bounds: L.LatLng): string[] {

        // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
        const countriesInView = countriesGeoJSON2.features.filter(feature => {
            return turf.booleanIntersects(feature.geometry as MultiPolygon, turf.point([bounds.lng, bounds.lat]));
        });

        // Trigger api calls
        return countriesInView.map(feature => feature.properties.Country);
    }

    getStatesInView(bounds: maplibre.LngLatBounds | any): string[] {
        const southwest = bounds.getSouthWest();
        const northeast = bounds.getNorthEast();

        const statesInView = statesGeoJSON2.features.filter(feature => {
            return turf.booleanIntersects(feature.geometry as Polygon,
                turf.bboxPolygon([southwest.lng, southwest.lat, northeast.lng, northeast.lat]));
        });

        // Trigger api calls
        return statesInView.map(feature => feature.properties.STATE as string);
    }
    getStatesInViewPoint(bounds: L.LatLng): string[] {

        // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
        const statesInView = statesGeoJSON2.features.filter(feature => {
            return turf.booleanIntersects(feature.geometry as Polygon, turf.point([bounds.lng, bounds.lat]));
        });

        // Trigger api calls
        return statesInView.map(feature => feature.properties.STATE as string);
    }

}