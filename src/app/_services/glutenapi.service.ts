import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TopicGroup, GMapsPin, IpAddressData, PinSummary, PinTopicDTO } from "../_model/model";
import { catchError } from 'rxjs';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlutenApiService {

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

    private handleErrorServerLog<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead
            this.postLog(error).subscribe();

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
    // Mordor
    //baseUrl = "https://localhost:7125";


    getPinTopic(country: string): Observable<TopicGroup[]> {
        return this.http.get<TopicGroup[]>(this.baseUrl + "/api/PinTopic?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<TopicGroup[]>(`getPinTopic id=${country}`)));
    }

    getPinDescription(pinId: number, language: string): Observable<PinSummary> {
        return this.http.get<PinSummary>(this.baseUrl + "/api/GetSummary?pinId=" + pinId + '&language=' + language, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<PinSummary>(`getSummary id=${pinId}, language=${language}`)));
    }

    getPin(country: string): Observable<PinTopicDTO[]> {
        return this.http.get<PinTopicDTO[]>(this.baseUrl + "/api/Pin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<PinTopicDTO[]>(`getPin id=${country}`)));
    }

    getPinDetails(country: string, pinId: number): Observable<PinTopicDTO[]> {
        return this.http.get<PinTopicDTO[]>(this.baseUrl + "/api/Pin?country=" + country + '&pinid=' + pinId, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<PinTopicDTO[]>(`getPinDetails id=${country},pinId=${pinId}`)));
    }

    getGMPin(country: string): Observable<GMapsPin[]> {
        return this.http.get<GMapsPin[]>(this.baseUrl + "/api/GMapsPin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<GMapsPin[]>(`getGMPin id=${country}`)));
    }

    getLocation(country: string): Observable<IpAddressData> {
        return this.http.get<IpAddressData>(this.baseUrl + "/api/GetLocation", this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<IpAddressData>(`getLocation id=${country}`)));
    }

    postMapHome(geoLatitude: number, geoLongitude: number): Observable<any> {
        return this.http.post(this.baseUrl + "/api/MapHome", JSON.stringify({ geoLatitude, geoLongitude }), this.httpOptionsPost)
            .pipe(catchError(this.handleErrorServerLog()));
    }

    postLog(message: any): Observable<any> {
        return this.http.post(this.baseUrl + "/api/Log", JSON.stringify({ message }), this.httpOptionsPost)
            .pipe(catchError(this.handleError()));
    }

}