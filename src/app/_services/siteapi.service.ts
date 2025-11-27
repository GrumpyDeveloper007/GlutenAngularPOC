import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CountryMeta } from "../_model/model";
import { catchError, tap } from 'rxjs';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteApiService {
    _countryMeta: CountryMeta[] = [];
    _selectedCountryMeta: CountryMeta | undefined;


    httpOptions = {
        headers: new HttpHeaders({})//'Content-Type': 'application/json'
    };

    httpOptionsNoCache = {
        headers: new HttpHeaders({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        })
    };

    httpOptionsPost = {
        headers: new HttpHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
    };

    constructor(
        private http: HttpClient
    ) { }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    setSelectedCountry(country: string) {
        this._selectedCountryMeta = this._countryMeta.find(o => o.Country == country);
    }

    getCountryMeta(): CountryMeta | undefined {
        return this._selectedCountryMeta;
    }

    loadCountryMeta(): Observable<CountryMeta[]> {
        return this.http.get<CountryMeta[]>("/countryMeta.json", this.httpOptions)
            .pipe(
                tap(data => this._countryMeta = data ?? []),
                catchError(this.handleError<CountryMeta[]>(`loadCountryMeta`)),
            );
    }

    getUrlCountry(): string | undefined {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        if (pathParts.length == 3 && pathParts[1] == 'c') {
            return decodeURI(pathParts[2]);
        }
        else return undefined;
    }
}