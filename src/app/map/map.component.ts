import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import { forkJoin, Observable, tap } from 'rxjs';
import { GMapsPin, TopicGroup } from "../_model/model";
import { Others, restaurantTypes } from "../_model/staticData";
import { ModalService, GlutenApiService, LocationService, MapDataService } from '../_services';
import { ModalComponent } from '../_components';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [
    NgFor,
    ModalComponent,
    FormsModule,
  ],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() selectedTopicGroupChange = new EventEmitter<TopicGroup>();
  @ViewChild('map') mapContainer!: ElementRef<HTMLElement>;
  map: Map | undefined;
  selectedTopicGroup: TopicGroup | null = null;
  currentMarkers: Marker[] = [];
  restaurants: Restaurant[] = [];
  fileUrl: SafeResourceUrl = "";
  pinTopics: TopicGroup[] = [];
  pinCache: { [id: string]: TopicGroup[]; } = {};
  gmPins: GMapsPin[] = [];
  gmPinCache: { [id: string]: GMapsPin[]; } = {};
  selectedPins = 0;
  _showHotels: boolean = true;
  _showStores: boolean = true;
  _showOthers: boolean = true;
  _showGMPins: boolean = true;
  mapBounds: maplibre.LngLatBounds = new maplibre.LngLatBounds();

  constructor(public sanitizer: DomSanitizer,
    protected modalService: ModalService, private http: HttpClient,
    private apiService: GlutenApiService,
    private locationService: LocationService,
    private mapDataService: MapDataService) { }

  @Input() set showHotels(value: boolean) {
    this._showHotels = value;
    console.debug("Map Hotels click ");
    // clear pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.loadMapPins();
  }
  @Input() set showStores(value: boolean) {
    this._showStores = value;
    console.debug("Map Stores click ");
    // clear pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.loadMapPins();
  }
  @Input() set showOthers(value: boolean) {
    this._showOthers = value;
    // clear pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.loadMapPins();
  }
  @Input() set showGMPins(value: boolean) {
    this._showGMPins = value;
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
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

  ngOnInit(): void {
  }
  ngOnDestroy() {
    this.map?.remove();
  }
  async ngAfterViewInit() {
    restaurantTypes.forEach(restaurant => {
      var a = new Restaurant(true, restaurant);
      this.restaurants.push(a);
    });

    var geoLocation = new maplibre.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true

      },
      trackUserLocation: true
    });

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
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=1nY38lyeIv8XEbtohY5t`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      interactive: true,
      renderWorldCopies: false
    });

    this.map.addControl(geoLocation);
    this.map.addControl(new NavigationControl({}), 'top-right');
    this.mapBounds = this.map.getBounds();

    this.map
      .on('moveend', (e: MouseEvent | TouchEvent | WheelEvent | undefined) => {
        if ((this.map === undefined)) return;
        var newBounds = this.map.getBounds();
        if (newBounds.getNorthEast().lat == this.mapBounds.getNorthEast().lat &&
          newBounds.getNorthEast().lng == this.mapBounds.getNorthEast().lng) return;
        this.mapMoved(e);
        this.mapBounds = this.map.getBounds();
      });

    this.loadMapPins();
  }

  mapMoved(e: MouseEvent | TouchEvent | WheelEvent | undefined) {
    if ((this.map === undefined)) return;
    this.loadMapPins();
  }

  loadMapPins() {
    this.pinTopics = [];
    this.gmPins = [];

    if ((this.map === undefined)) return;

    const bounds = this.map.getBounds();
    // Trigger api calls
    var waitForDataLoad = false;
    const countryNames = this.mapDataService.getCountriesInView(bounds);
    console.debug("Countries in view: " + countryNames);
    const requests: Observable<any>[] = [];
    for (let key in countryNames) {
      let value = countryNames[key];
      if (value in this.pinCache) {
        // key exists
        this.pinTopics = this.pinTopics.concat(this.pinCache[value]);
      } else {
        // key does not exist
        waitForDataLoad = true;
        this.pinCache[value] = [];
        requests.push(this.apiService.getPinTopic(value).pipe(
          tap(data => {
            this.pinCache[value] = data;
            this.pinTopics = this.pinTopics.concat(this.pinCache[value]);
          })));
      }

      if (value in this.gmPinCache) {
        // key exists
        this.gmPins = this.gmPins.concat(this.gmPinCache[value]);
      } else {
        // key does not exist
        waitForDataLoad = true;
        this.gmPinCache[value] = [];
        requests.push(this.apiService.getGMPin(value).pipe(
          tap(data => {
            this.gmPinCache[value] = data;
            this.gmPins = this.gmPins.concat(this.gmPinCache[value]);
          })));
      }
    }

    forkJoin(requests).subscribe(_ => {
      // all observables have been completed
      this.showMapPins();
    });

    if (!waitForDataLoad) {
      this.showMapPins();
    }

  }

  showMapPins() {
    var map: Map;
    if ((this.map === undefined)) return;
    var map = this.map
    var exportData = "Latitude, Longitude, Description\r\n";
    this.selectedPins = 0;

    console.debug("Updating pins");
    const bounds = map.getBounds();

    // Remove existing pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.currentMarkers = [];

    this.pinTopics.forEach(pin => {
      if (this.selectedPins >= 500) return;
      if (pin.geoLatitude > bounds._ne.lat) return;
      if (pin.geoLatitude < bounds._sw.lat) return;
      if (pin.geoLongitude > bounds._ne.lng) return;
      if (pin.geoLongitude < bounds._sw.lng) return;

      var isStore = pin.restaurantType != null && (pin.restaurantType.includes("store") || pin.restaurantType.includes("Supermarket")
        || pin.restaurantType.includes("shop")
        || pin.restaurantType.includes("market") || pin.restaurantType.includes("mall") || pin.restaurantType.includes("Hypermarket")
      );
      var isHotel = pin.restaurantType == "Hotel";
      var isOther = pin.restaurantType != null && Others.includes(pin.restaurantType);
      var isSelected = this.isSelected(pin.restaurantType);
      if (!isSelected) return;
      if (!this._showHotels && isHotel) return;
      if (!this._showStores && isStore) return;
      if (!this._showOthers && isOther) return;
      this.selectedPins++;
      exportData += `${pin.geoLatitude},${pin.geoLongitude},${pin.label}\r\n`;

      // trigger event to call a function back in angular
      var popup = new maplibre.Popup({ offset: 25 })
        .setHTML(`<h3>${pin.label}</h3>`)
        .on('open', () => {
          this.pinSelected(pin);
        });
      var color = "#FF0000";
      if (isHotel) color = "#00FF00";
      if (isStore) color = "#0000FF";
      if (isOther) color = "#00FFFF";

      const marker = new Marker({ color: color })
        .setLngLat([pin.geoLongitude, pin.geoLatitude])
        .setPopup(popup)
        .addTo(map);
      this.currentMarkers.push(marker);

    });

    if (this._showGMPins) {
      this.gmPins.forEach(pin => {
        if (this.selectedPins >= 500) return;
        if (Number.parseFloat(pin.geoLatitude) > bounds._ne.lat) return;
        if (Number.parseFloat(pin.geoLatitude) < bounds._sw.lat) return;
        if (Number.parseFloat(pin.geoLongitude) > bounds._ne.lng) return;
        if (Number.parseFloat(pin.geoLongitude) < bounds._sw.lng) return;

        this.selectedPins++;
        exportData += `${pin.geoLatitude},${pin.geoLongitude},${pin.label}\r\n`;

        // trigger event to call a function back in angular
        var popup = new maplibre.Popup({ offset: 25 })
          .setHTML(`<h3>${pin.label}</h3>`)
          .on('open', () => {
            this.pinSelected(pin);
          });
        var color = "#7f7f7f";

        const marker = new Marker({ color: color })
          .setLngLat([parseFloat(pin.geoLongitude), parseFloat(pin.geoLatitude)])
          .setPopup(popup)
          .addTo(map);
        this.currentMarkers.push(marker);
      });
    }

    console.debug("selected pins :" + this.selectedPins);
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