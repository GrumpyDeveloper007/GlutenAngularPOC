import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myGMPinData from './JapanGM.json';
import { Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TopicGroup, TopicGroupClass } from "../model/model";
import { Others, restaurantTypes } from "../model/staticData";
import { EventEmitter, Output, Input } from '@angular/core';
import { ModalService } from '../_services';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../_components';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as turf from "@turf/turf";
import { MultiPolygon } from 'geojson';
import countriesGeoJSON2 from '../staticdata/countries.geo.json';
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


  constructor(private renderer: Renderer2, public sanitizer: DomSanitizer, protected modalService: ModalService, private http: HttpClient) { }

  private _showHotels: boolean = true;
  private _showStores: boolean = true;
  private _showOthers: boolean = true;
  private _showGMPins: boolean = true;

  @Input() set showHotels(value: boolean) {

    this._showHotels = value;
    console.debug("Map Hotels click ");
    // clear pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.loadMapPins();
  }
  get showHotels(): boolean {
    return this._showHotels;
  }

  @Input() set showStores(value: boolean) {

    this._showStores = value;
    console.debug("Map Stores click ");
    // clear pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.loadMapPins();
  }
  get showStores(): boolean {
    return this._showStores;
  }

  @Input() set showOthers(value: boolean) {
    this._showOthers = value;
    // clear pins
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
    this.loadMapPins();
  }
  get showOthers(): boolean {
    return this._showOthers;
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
          console.debug('Is selected');
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

  ngAfterViewInit() {
    restaurantTypes.forEach(restaurant => {
      var a = new Restaurant(true, restaurant);
      this.restaurants.push(a);
    });

    const initialState = { lng: 139.753, lat: 35.6844, zoom: 14 };
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=1nY38lyeIv8XEbtohY5t`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      interactive: true,
    });
    this.map.addControl(new maplibre.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));
    this.map.addControl(new NavigationControl({}), 'top-right');

    this.map
      .on('moveend', (e: MouseEvent | TouchEvent | WheelEvent | undefined) => {
        this.mapMoved(e);
      });

    this.loadMapPins();
  }

  getPinTopic(country: string) {
    // now returns an Observable of Config
    return this.http.get<TopicGroup[]>("https://thegfshire.azurewebsites.net/api/PinTopic?country=" + country);
  }

  mapMoved(e: MouseEvent | TouchEvent | WheelEvent | undefined) {
    if (!(this.map === undefined)) {
      this.loadMapPins();
    }
  }


  loadMapPins() {
    this.pinTopics = [];
    var map: Map;

    if (!(this.map === undefined)) {
      // Remove existing pins
      this.currentMarkers.forEach((marker: Marker) => marker.remove())
      this.currentMarkers = [];

      const bounds = this.map.getBounds();
      const southwest = bounds.getSouthWest();
      const northeast = bounds.getNorthEast();

      // Load or fetch your GeoJSON data (e.g., countriesGeoJSON)
      const countriesInView = countriesGeoJSON2.features.filter(feature => {
        return turf.booleanIntersects(feature.geometry as MultiPolygon, turf.bboxPolygon([southwest.lng, southwest.lat, northeast.lng, northeast.lat]));
      });

      // Trigger api calls
      var waitForDataLoad = false;
      const countryNames = countriesInView.map(feature => feature.properties.name);
      for (let key in countryNames) {
        let value = countryNames[key];
        if (value in this.pinCache) {
          // key exists
          this.pinTopics = this.pinTopics.concat(this.pinCache[value]);
        } else {
          // key does not exist
          console.log('loading data for :' + value);
          waitForDataLoad = true;
          this.pinCache[value] = [];
          const arr = [];
          arr.push(this.getPinTopic(value)
            .subscribe(data => {
              this.pinCache[value] = data;
              console.debug("Loaded data for :" + value);
              this.pinTopics = this.pinTopics.concat(this.pinCache[value]);

              if (data.length > 0) {
                this.showMapPins();
              }

            }));

        }
      }

      if (!waitForDataLoad) {
        this.showMapPins();
      }

    }
  }

  showMapPins() {
    var map: Map;
    if (!(this.map === undefined)) {
      var map = this.map
      var exportData = "Latitude, Longitude, Description\r\n";

      console.debug("Updating pins");
      var selectedPins = 0;
      const bounds = map.getBounds();
      this.pinTopics.forEach(pin => {
        if (selectedPins < 500) {
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
          selectedPins++;
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
        }
      });

      if (this._showGMPins) {
        myGMPinData.forEach(pin => {
          exportData += `${pin.GeoLatitude},${pin.GeoLongitude},${pin.Label}\r\n`;

          // trigger event to call a function back in angular
          var popup = new maplibre.Popup({ offset: 25 })
            .setHTML(`<h3>${pin.Label}</h3>`)
            .on('open', () => {
              this.pinSelected(pin);
            });
          var color = "#7f7f7f";

          const marker = new Marker({ color: color })
            .setLngLat([parseFloat(pin.GeoLongitude), parseFloat(pin.GeoLatitude)])
            .setPopup(popup)
            .addTo(map);
          this.currentMarkers.push(marker);
        });
      }

      console.debug("selected pins :" + selectedPins);
      const blob = new Blob([exportData], { type: 'application/octet-stream' });
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }
  }


  ngOnDestroy() {
    this.map?.remove();
  }

}

export class Restaurant {
  constructor(
    public Show: boolean,
    public Name: string,
  ) { }
}