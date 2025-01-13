import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TopicGroup, GMapsPin } from "../_model/model";
import { catchError } from 'rxjs';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlutenApiService {

    httpOptions = {
        headers: new HttpHeaders({})//'Content-Type': 'application/json'
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

    // Dev
    baseUrl = "https://thedevshire.azurewebsites.net";
    // Prod
    //baseUrl = "https://thegfshire.azurewebsites.net";
    // Local
    //baseUrl = "http://localhost:7121";

    getPinTopic(country: string): Observable<TopicGroup[]> {
        return this.http.get<TopicGroup[]>(this.baseUrl + "/api/PinTopic?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleError<TopicGroup[]>(`getPinTopic id=${country}`)));
    }

    getGMPin(country: string): Observable<GMapsPin[]> {
        return this.http.get<GMapsPin[]>(this.baseUrl + "/api/GMapsPin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleError<GMapsPin[]>(`getGMPin id=${country}`)));
    }

    postMapHome(geoLatitude: number, geoLongitude: number): Observable<any> {
        return this.http.post(this.baseUrl + "/api/MapHome", JSON.stringify({ geoLatitude, geoLongitude }), this.httpOptionsPost)
            .pipe(catchError(this.handleError()));

    }

}