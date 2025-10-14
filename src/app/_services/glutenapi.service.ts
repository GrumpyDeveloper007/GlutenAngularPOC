import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TopicGroup, GMapsPin, IpAddressData, PinSummary, PinTopicDetailDTO, GroupData } from "../_model/model";
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
            this.postLog({ operation: operation, error: error }).subscribe();

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    // Dev
    //baseUrl = "https://thedevshire.azurewebsites.net";
    // Prod
    baseUrl = "https://thegfshire.azurewebsites.net";
    // Local
    //baseUrl = "http://localhost:7121";
    // Mordor
    //baseUrl = "https://localhost:7125";


    // Returns only info needed for the map
    getPins(country: string): Observable<TopicGroup[]> {
        return this.http.get<TopicGroup[]>(this.baseUrl + "/api/Pin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<TopicGroup[]>(`getPin id=${country}`)));
    }

    // Returns details needed for the side bar
    getPinDetails(pinId: number, language: string): Observable<PinTopicDetailDTO[]> {
        return this.http.get<PinTopicDetailDTO[]>(this.baseUrl + "/api/PinDetail?pinid=" + pinId + "&language=" + language, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<PinTopicDetailDTO[]>(`getPinDetails pinId=${pinId},language=${language}`)));
    }

    // Returns details needed for the list view
    getPinDetailsCountry(country: string): Observable<PinTopicDetailDTO[]> {
        return this.http.get<PinTopicDetailDTO[]>(this.baseUrl + "/api/PinDetail?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<PinTopicDetailDTO[]>(`getPinDetails id=${country}`)));
    }

    // Use IP address to center the map
    getLocation(country: string): Observable<IpAddressData> {
        return this.http.get<IpAddressData>(this.baseUrl + "/api/GetLocation", this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<IpAddressData>(`getLocation id=${country}`)));
    }

    // Get pins sourced from GM
    getGMPin(country: string): Observable<GMapsPin[]> {
        return this.http.get<GMapsPin[]>(this.baseUrl + "/api/GMapsPin?country=" + country, this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<GMapsPin[]>(`getGMPin id=${country}`)));
    }

    postMapHome(geoLatitude: number, geoLongitude: number): Observable<any> {
        return this.http.post(this.baseUrl + "/api/MapHome", JSON.stringify({ geoLatitude, geoLongitude }), this.httpOptionsPost)
            .pipe(catchError(this.handleErrorServerLog(`getGMPin geoLatitude=${geoLatitude},geoLongitude=${geoLongitude}`)));
    }

    // Log errors to the database
    postLog(message: any): Observable<any> {
        return this.http.post(this.baseUrl + "/api/Log", JSON.stringify({ message }), this.httpOptionsPost);
    }

    getGroups(): Observable<GroupData[]> {
        return this.http.get<GroupData[]>(this.baseUrl + "/api/Groups", this.httpOptions)
            .pipe(catchError(this.handleErrorServerLog<GroupData[]>(`getGroups`)));
    }


}