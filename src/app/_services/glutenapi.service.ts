import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TopicGroup, GMapsPin } from "../_model/model";
import { catchError } from 'rxjs';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlutenApiService {

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
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


    getPinTopic(country: string): Observable<TopicGroup[]> {
        // now returns an Observable of Config
        return this.http.get<TopicGroup[]>("https://thegfshire.azurewebsites.net/api/PinTopic?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleError<TopicGroup[]>(`getPinTopic id=${country}`)));
    }

    getGMPin(country: string): Observable<GMapsPin[]> {
        // now returns an Observable of Config
        return this.http.get<GMapsPin[]>("https://thegfshire.azurewebsites.net/api/GMapsPin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleError<GMapsPin[]>(`getGMPin id=${country}`)));
    }

}