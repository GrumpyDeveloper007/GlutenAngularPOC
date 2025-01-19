import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable, tap } from 'rxjs';
import { GMapsPin, TopicGroup } from "../_model/model";
import { Others, restaurantTypes } from "../_model/staticData";
import { ModalService, GlutenApiService, LocationService, MapDataService, PinService, DiagnosticService } from '../_services';
import { ModalComponent } from '../_components';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { latLng, LatLngBounds, tileLayer } from 'leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [
    NgIf,
    NgFor,
    ModalComponent,
    FormsModule,
    MatProgressSpinnerModule
  ],
})
export class MapLeafletComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() selectedTopicGroupChange = new EventEmitter<TopicGroup>();
  @ViewChild('map') mapContainer!: ElementRef<HTMLElement>;
  map: L.Map | undefined;
  selectedTopicGroup: TopicGroup | null = null;
  restaurants: Restaurant[] = [];
  fileUrl: SafeResourceUrl = "";
  pinCache: { [id: string]: TopicGroup[]; } = {};
  gmPinCache: { [id: string]: GMapsPin[]; } = {};
  selectedPins = 0;
  _showHotels: boolean = true;
  _showStores: boolean = true;
  _showOthers: boolean = true;
  _showGMPins: boolean = true;
  mapBounds: LatLngBounds = new LatLngBounds([46.879966, -121.726909], [46.879966, -121.726909]);
  loaded = true;
  firstShown = true;

  markerGroup: L.LayerGroup = new L.LayerGroup();

  constructor(public sanitizer: DomSanitizer,
    protected modalService: ModalService, private http: HttpClient,
    private apiService: GlutenApiService,
    private locationService: LocationService,
    private mapDataService: MapDataService,
    private pinService: PinService,
    private diagService: DiagnosticService) { }

  @Input() set showHotels(value: boolean) {
    this._showHotels = value;
    this.loadMapPins();
  }
  @Input() set showStores(value: boolean) {
    this._showStores = value;
    this.loadMapPins();
  }
  @Input() set showOthers(value: boolean) {
    this._showOthers = value;
    this.loadMapPins();
  }
  @Input() set showGMPins(value: boolean) {
    this._showGMPins = value;
    this.loadMapPins();
  }

  selectNone(): void {
    this.restaurants.forEach(restaurant => {
      restaurant.Show = false;
    });
  }

  selectAll(): void {
    this.restaurants.forEach(restaurant => {
      restaurant.Show = true;
    });
  }

  isSelected(restaurantType: string): boolean {
    var result = false;
    // Special 1st option
    if (this.restaurants[0].Name == "All" && this.restaurants[0].Show) return true;

    this.restaurants.forEach(restaurant => {
      if (restaurant.Name === restaurantType) {
        if (restaurant.Show === true) {
          result = true;
        }
      }
    });
    return result;
  }

  selectComplete(): void {
    this.modalService.close();
    this.loadMapPins();
  }

  pinSelected(pin: any): void {
    this.selectedTopicGroup = pin as TopicGroup;
    this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
    return;
  }

  ngOnInit() {
    var location = { latitude: 35.6844, longitude: 139.753 };
    this.map = L.map('map').setView([location.latitude, location.longitude], 8);
    var key = "4XNqZU5WGeN8rGGyXkiP";
    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`, { //style URL
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 1,
      attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
      crossOrigin: true
    }).addTo(this.map);
    https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}
    /*    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
       }).addTo(this.map);*/
    this.map.addLayer(this.markerGroup);
  }
  ngOnDestroy() {
  }
  async ngAfterViewInit() {
    if ((this.map === undefined)) return;
    restaurantTypes.forEach(restaurant => {
      var a = new Restaurant(true, restaurant);
      this.restaurants.push(a);
    });
    // Makerを配置
    //L.marker([0, 0]).bindPopup('<b>Hello!!</b>').addTo(this.map);

    var location = { latitude: 35.6844, longitude: 139.753 };
    await this.locationService.getUserLocation()
      .then((loc) => {
        location = loc;
      })
      .catch((err) => {
        console.debug(err);
      });
    this.apiService.postMapHome(location.latitude, location.longitude).subscribe();

    const initialState = { lng: location.longitude, lat: location.latitude, zoom: 14 };
    this.map.setView([initialState.lat, initialState.lng], initialState.zoom);
    this.mapBounds = this.map.getBounds();

    this.map
      .on('moveend', (e: L.LeafletEvent) => {
        if ((this.map === undefined)) return;
        var newBounds = this.map.getBounds();
        if (newBounds.getNorthEast().lat == this.mapBounds.getNorthEast().lat &&
          newBounds.getNorthEast().lng == this.mapBounds.getNorthEast().lng) return;
        this.mapMoved(e);
        this.mapBounds = this.map.getBounds();
      });

    this.loadMapPins();

  }

  mapMoved(e: L.LeafletEvent) {
    if ((this.map === undefined)) return;
    this.loadMapPins();
  }

  loadMapPins() {
    const howLong = this.diagService.timer();
    if ((this.map === undefined)) return;
    const bounds = this.map.getBounds();

    // Trigger api calls
    var waitForDataLoad = false;
    const countryNames = this.mapDataService.getCountriesInView(bounds);
    console.debug("Countries in view: " + countryNames);
    const requests: Observable<any>[] = [];
    for (let key in countryNames) {
      let value = countryNames[key];
      if (!(value in this.pinCache)) {
        // key does not exist
        waitForDataLoad = true;
        requests.push(this.apiService.getPinTopic(value).pipe(
          tap(data => {
            this.pinCache[value] = data;
          })));
      }

      if (!(value in this.gmPinCache)) {
        // key does not exist
        waitForDataLoad = true;
        requests.push(this.apiService.getGMPin(value).pipe(
          tap(data => {
            this.gmPinCache[value] = data;
          })));
      }
    }

    forkJoin(requests).subscribe(_ => {
      // all observables have been completed
      console.debug("Loading data complete :", howLong.ms);
      // Add this after the map is initialized
      if (this.firstShown) {
        this.firstShown = false;
        if ((this.map === undefined)) return;
        this.map.invalidateSize();
      }

      this.showMapPins(countryNames);
    });

    if (!waitForDataLoad) {
      console.debug("Data load skipped");
      this.showMapPins(countryNames);
    }
  }

  getPinsInCountries(countryNames: string[]): TopicGroup[] {
    var pinTopics: TopicGroup[] = [];

    countryNames.forEach(key => {
      pinTopics = pinTopics.concat(this.pinCache[key]);
    });
    return pinTopics;
  }

  getGMPinsInCountries(countryNames: string[]): GMapsPin[] {
    var gmPins: GMapsPin[] = [];

    countryNames.forEach(key => {
      gmPins = gmPins.concat(this.gmPinCache[key]);
    });
    return gmPins;
  }


  showMapPins(countryNames: string[]) {
    var pinTopics = this.getPinsInCountries(countryNames);
    var gmPins = this.getGMPinsInCountries(countryNames);
    const liveMode = true; // this makes it easier to see generic pins
    this.loaded = false;
    var map: L.Map;
    if ((this.map === undefined)) return;
    var map = this.map
    var pinsToExport: (TopicGroup | GMapsPin)[] = [];
    this.selectedPins = 0;

    //console.debug("Updating pins :" + pinTopics.length);
    const bounds = map.getBounds();

    // Remove existing pins
    this.markerGroup.clearLayers();

    pinTopics.forEach(pin => {
      try {
        if (pin == undefined) return;
        if (this.selectedPins >= 400) return;
        if (!this.pinService.isInBoundsLeaflet(pin.geoLatitude, pin.geoLongitude, bounds)) return;

        var isSelected = this.isSelected(pin.restaurantType);
        if (!isSelected) return;
        if (!this._showHotels && this.pinService.isHotel(pin)) return;
        if (!this._showStores && this.pinService.isStore(pin)) return;
        if (!this._showOthers && this.pinService.isOther(pin)) return;
        pinsToExport.push(pin);

        // trigger event to call a function back in angular
        var popup = this.pinService.createPopup(pin.label);
        popup.on('open', () => {
          this.pinSelected(pin);
        });
        var color = this.pinService.getColor(pin);

        const marker = new L.Marker([pin.geoLatitude, pin.geoLongitude])
        var icon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label);
        marker.setIcon(icon);
        marker.addEventListener('click', () => {
          this.pinSelected(pin);
        })
        if (icon.options.iconUrl == "Red.png" || liveMode) {
          marker.addTo(this.markerGroup);
          this.selectedPins++;
        }

      } catch (e) {
        console.error("Error adding pin to map", e);
      }
    });

    if (this._showGMPins) {
      gmPins.forEach(pin => {
        try {
          if (pin == undefined) return;
          if (this.selectedPins >= 400) return;
          if (!this.pinService.isInBoundsLeaflet(parseFloat(pin.geoLatitude), parseFloat(pin.geoLongitude), bounds)) return;
          var isSelected = this.isSelected(pin.restaurantType);
          if (!isSelected) return;

          pinsToExport.push(pin);

          // trigger event to call a function back in angular
          var popup = this.pinService.createPopup(pin.label);
          popup.on('open', () => {
            this.pinSelected(pin);
          });

          var color = "#7f7f7f";

          const marker = new L.Marker([parseFloat(pin.geoLatitude), parseFloat(pin.geoLongitude)])
          var icon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label);
          marker.setIcon(icon);
          marker.addEventListener('click', () => {
            this.pinSelected(pin);
          })
          if (icon.options.iconUrl == "Grey.png" || liveMode) {
            marker.addTo(this.markerGroup);
            this.selectedPins++;
          }
        } catch (e) {
          console.error("Error adding pin to map", e);
        }
      });
    }

    console.debug("selected pins :" + this.selectedPins);
    var exportData = "Latitude, Longitude, Description\r\n";
    pinsToExport.forEach(pin => {
      exportData += `${pin.geoLatitude},${pin.geoLongitude},${pin.label}\r\n`;
    });
    const blob = new Blob([exportData], { type: 'application/octet-stream' });
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }
}

export class Restaurant {
  constructor(
    public Show: boolean,
    public Name: string,
  ) { }
}