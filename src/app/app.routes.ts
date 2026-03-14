import { Routes } from '@angular/router';
import { CityComponent } from './city/city.component';
import { MapViewComponent } from './mapView/mapView.component';

export const routes: Routes = [
    { path: '', component: MapViewComponent },
    { path: 'places/:id', component: MapViewComponent },
    { path: 'c/:country', component: MapViewComponent },
    { path: 'city/:cityName', component: CityComponent }
];
