import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom, forkJoin, Observable, tap } from 'rxjs';
import { GMapsPin, TopicGroup } from "../_model/model";
import { Restaurant } from "../_model/restaurant";
import { restaurantTypes } from "../_model/staticData";
import { ModalService, GlutenApiService, LocationService, MapDataService, PinService, DiagnosticService, AnalyticsService } from '../_services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import "leaflet.locatecontrol"; // Import plugin
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Import styles
import * as L from 'leaflet';
import { ModalComponent } from '../_components';


@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    ModalComponent,
    MatProgressSpinnerModule
  ],
})
export class MapLeafletComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() selectedTopicGroupChange = new EventEmitter<TopicGroup>();
  @ViewChild('map') mapContainer!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef;
  map: L.Map | undefined;
  selectedTopicGroup: TopicGroup | null = null;
  restaurants: Restaurant[] = [];
  fileUrl: SafeResourceUrl = "";
  pendingCountries: string[] = [];
  pinCache: { [id: string]: TopicGroup[]; } = {};
  gmPinCache: { [id: string]: GMapsPin[]; } = {};
  selectedPins = 0;
  pinsToExport: (TopicGroup | GMapsPin)[] = [];
  totalPins = 0;
  _showHotels: boolean = true;
  _showStores: boolean = true;
  _showOthers: boolean = true;
  _showGMPins: boolean = true;
  _showChains: boolean = true;
  _showTemporarilyClosed: boolean = true;
  searchText: string = "";

  mapBounds: L.LatLngBounds = new L.LatLngBounds([46.879966, -121.726909], [46.879966, -121.726909]);
  loaded = true;
  loadingData = false;
  firstShown = true;

  markerGroup: L.LayerGroup = new L.LayerGroup();

  constructor(public sanitizer: DomSanitizer,
    protected modalService: ModalService, private http: HttpClient,
    private apiService: GlutenApiService,
    private locationService: LocationService,
    private mapDataService: MapDataService,
    public pinService: PinService,
    private diagService: DiagnosticService,
    private gaService: AnalyticsService) { }

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
  @Input() set showChains(value: boolean) {
    this._showChains = value;
    this.loadMapPins();
  }
  @Input() set showTemporarilyClosed(value: boolean) {
    this._showTemporarilyClosed = value;
    this.loadMapPins();
  }

  @Input() set updateRestaurants(value: Restaurant[]) {
    this.restaurants = value;
    this.loadMapPins();
  }

  isSelected(restaurantType: string): boolean {
    var result = false;
    // Special 1st option

    if (this.pinService.isHotel(restaurantType)) return this._showHotels;
    if (this.pinService.isStore(restaurantType)) return this._showStores;
    if (this.pinService.isOther(restaurantType)) return this._showOthers;

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

  // TODO:Write up?
  openListView(): void {
    this.searchInput.nativeElement.focus();
  }

  closeListView(): void {
    this.searchText = "";
    this.modalService.close();
  }

  locate(pin: (TopicGroup | GMapsPin)): void {
    var t = pin as TopicGroup;
    this.map?.flyTo({ lat: t.geoLatitude, lng: t.geoLongitude }, 18);
    this.pinSelected(pin);
    this.modalService.close();
  }

  pinSelected(pin: any): void {
    this.selectedTopicGroup = pin as TopicGroup;
    this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
    this.gaService.trackEvent("Pin selected:" + this.selectedTopicGroup.label, this.selectedTopicGroup.label, "Map");
    return;
  }

  ngOnInit() {
    var location = { latitude: 35.6844, longitude: 139.753 };
    //http://leaflet-extras.github.io/leaflet-providers/preview/
    this.map = L.map('map').setView([location.latitude, location.longitude], 8).setMinZoom(2);
    /*     var key = "4XNqZU5WGeN8rGGyXkiP";
        L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`, { //style URL
        noWrap: true,
          tileSize: 512,
          zoomOffset: -1,
          minZoom: 1,
          attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
          crossOrigin: true
        }).addTo(this.map); */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    //L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
    //     noWrap: true, attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //}).addTo(this.map);

    //L.control.locate().addTo(this.map);

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

    var location = { latitude: 35.6844, longitude: 139.753 };
    try {
      var ipLocation = await firstValueFrom(this.apiService.getLocation(""))
      if (ipLocation != null && ipLocation.loc != null && ipLocation.loc != null) {
        var latlng = ipLocation.loc.split(',');
        console.log(latlng);
        location = { latitude: parseFloat(latlng[0]), longitude: parseFloat(latlng[1]) }
      }
    }
    catch { }

    await this.locationService.getUserLocation()
      .then((loc) => {
        location = loc;
      })
      .catch((err) => {
        console.debug(err);
      });


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

    // Trigger api calls
    var waitForDataLoad = false;
    const bounds = this.map.getBounds();
    var countryNames = this.mapDataService.getCountriesInView(bounds);
    console.debug("Countries in view: " + countryNames);
    const requests: Observable<any>[] = [];
    for (let key in countryNames) {
      let value = countryNames[key];
      if (!(this.pendingCountries.includes(value))) {
        if (!(value in this.pinCache)) {
          // key does not exist
          this.pendingCountries.push(value);
          //console.log("pending :" + this.pendingCountries);
          this.loadingData = true;
          waitForDataLoad = true;
          requests.push(this.apiService.getPinTopic(value).pipe(
            tap(data => {
              this.pinCache[value] = data;
              this.gaService.trackEvent("Loaded:" + value, "Map loaded", "Map");
              const index = this.pendingCountries.indexOf(value, 0);
              if (index > -1) {
                this.pendingCountries.splice(index, 1);
              }
            })));
        }

        if (!(value in this.gmPinCache)) {
          // key does not exist
          this.loadingData = true;
          waitForDataLoad = true;
          requests.push(this.apiService.getGMPin(value).pipe(
            tap(data => {
              this.gmPinCache[value] = data;
            })));
        }
      }
    }

    forkJoin(requests).subscribe(_ => {
      // all observables have been completed
      console.debug("Loading data join :", howLong.ms);
      if (this.pendingCountries.length == 0) {
        console.debug("Loading data complete :", howLong.ms);
        this.loadingData = false;
      }
      // Add this after the map is initialized
      if (this.firstShown) {
        this.firstShown = false;
        if ((this.map === undefined)) return;
        this.map.invalidateSize();
      }

      // Refresh country names to ensure we have the latest 
      if (!(this.map === undefined)) {
        const bounds = this.map.getBounds();
        countryNames = this.mapDataService.getCountriesInView(bounds);
      }
      this.showMapPins(countryNames);
    });

    if (!waitForDataLoad) {
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
    this.gaService.trackEvent("Show:" + countryNames.toString(), "Map shown", "Map");
    var pinTopics = this.getPinsInCountries(countryNames);
    var gmPins = this.getGMPinsInCountries(countryNames);
    const liveMode = true; // this makes it easier to see generic pins
    this.loaded = false;
    var map: L.Map;
    if ((this.map === undefined)) return;
    var map = this.map
    this.pinsToExport = [];
    var pinsToExport: (TopicGroup | GMapsPin)[] = [];
    this.selectedPins = 0;
    this.totalPins = 0;

    //console.debug("Updating pins :" + pinTopics.length);
    const bounds = map.getBounds();

    // Remove existing pins
    this.markerGroup.clearLayers();

    pinTopics.forEach(pin => {
      try {
        if (pin == undefined) return;
        this.totalPins++;
        if (this.selectedPins >= 400) return;
        if (!this._showChains && !!pin.isC) return;
        if (!this._showTemporarilyClosed && !!pin.isTC) return;

        if (!this.pinService.isInBoundsLeaflet(pin.geoLatitude, pin.geoLongitude, bounds)) return;
        if (!this.isSelected(pin.restaurantType)) return;
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
        if (icon.options.iconUrl == "Red.png"
          || icon.options.iconUrl == "Blue.png"
          || icon.options.iconUrl == "Green.png"
          || icon.options.iconUrl == "Cyan.png"
          || liveMode) {
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
          this.totalPins++;
          if (this.selectedPins >= 400) return;
          if (!this.pinService.isInBoundsLeaflet(parseFloat(pin.geoLatitude), parseFloat(pin.geoLongitude), bounds)) return;
          if (!this.isSelected(pin.restaurantType)) return;

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

    var exportData = "Latitude, Longitude, Description\r\n";
    this.pinsToExport = pinsToExport.sort((a, a2) => {
      if (a.label > a2.label) {
        return 1;
      }

      if (a.label < a2.label) {
        return -1;
      }

      return 0;
    });
    pinsToExport.forEach(pin => {
      exportData += `${pin.geoLatitude},${pin.geoLongitude},${pin.label}\r\n`;
    });
    const blob = new Blob([exportData], { type: 'application/octet-stream' });
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  showPinListView(): void {
    this.modalService.open('modal-listView');
    // Add small delay to ensure modal is rendered
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 100);
  }
}

