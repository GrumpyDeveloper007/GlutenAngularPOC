import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from "./app.component";

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: 'main', component: AppComponent },
            { path: '', redirectTo: 'main', pathMatch: 'full' },
            {
                path: 'products',
                loadChildren: () =>
                    import('./app.component').then(m => m.AppComponent)
            },
            { path: '**', redirectTo: 'main', pathMatch: 'full' }
        ], { bindToComponentInputs: true })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
