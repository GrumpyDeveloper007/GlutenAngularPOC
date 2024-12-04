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

    getPinTopic(country: string): Observable<TopicGroup[]> {
        return this.http.get<TopicGroup[]>("https://thegfshire.azurewebsites.net/api/PinTopic?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleError<TopicGroup[]>(`getPinTopic id=${country}`)));
    }

    getGMPin(country: string): Observable<GMapsPin[]> {
        return this.http.get<GMapsPin[]>("https://thegfshire.azurewebsites.net/api/GMapsPin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleError<GMapsPin[]>(`getGMPin id=${country}`)));
    }

    postMapHome(geoLatitude: number, geoLongitude: number): Observable<any> {
        console.debug("postMapHome: " + geoLatitude + " " + geoLongitude);
        return this.http.post("https://thegfshire.azurewebsites.net/api/MapHome", JSON.stringify({ geoLatitude, geoLongitude }), this.httpOptionsPost)
            .pipe(catchError(this.handleError()));

    }

}