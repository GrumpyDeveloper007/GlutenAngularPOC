import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', component: AppComponent },
    { path: 'places/:id', component: AppComponent },
    { path: 'c/:country', component: AppComponent }
];
