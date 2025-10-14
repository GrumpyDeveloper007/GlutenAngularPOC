import { Injectable } from '@angular/core';
import * as maplibre from 'maplibre-gl';
import * as turf from "@turf/turf";
import { MultiPolygon, Polygon } from 'geojson';
//import countriesGeoJSON2 from '../staticdata/countries.geo.json';
import countriesGeoJSON2 from '../staticdata/World-EEZ.geo.json';
import statesGeoJSON2 from '../staticdata/statesSimplified.geo.json';


@Injectable({ providedIn: 'root' })
export class MapDataService {


    constructor(

    ) { }

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