import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myData from './TopicsExport.json';
import { Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TopicGroup } from "../model/model";
import { Others, restaurantTypes } from "../model/staticData";
import { EventEmitter, Output, Input } from '@angular/core';
import { ModalService } from '../_services';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../_components';
import { NgIf, NgFor } from '@angular/common';

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

  bodyText = 'This text can be updated in modal 1';

  constructor(private renderer: Renderer2, public sanitizer: DomSanitizer, protected modalService: ModalService) { }

  private _showHotels: boolean = true;
  private _showStores: boolean = true;
  private _showOthers: boolean = true;

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

    console.debug("Total pins :" + myData.length);
    console.debug("is undefined :" + (this.map === undefined));
    console.debug("map :" + this.map);
    this.loadMapPins();
  }

  mapMoved(e: MouseEvent | TouchEvent | WheelEvent | undefined) {
    if (!(this.map === undefined)) {
      this.loadMapPins();
    }
  }

  loadMapPins() {
    var pinTopics: any[] = myData;
    var map: Map;
    if (!(this.map === undefined)) {
      console.debug("Updating pins");
      var bounds = this.map.getBounds();
      this.currentMarkers.forEach((marker: Marker) => marker.remove())
      this.currentMarkers = [];

      map = this.map
      var exportData = "Latitude, Longitude, Description\r\n";

      var selectedPins = 0;
      pinTopics.forEach(pin => {
        /*e.g. _ne: Object { lng: 139.77638886261684, lat: 35.690465002504595 }
        lat: 35.690465002504595
        lng: 139.77638886261684
          <prototype>: Object { … }
        _sw: Object { lng: 139.72471878815406, lat: 35.674081465100244 }
        lat: 35.674081465100244
        lng: 139.72471878815406*/
        if (pin.GeoLatitude > bounds._ne.lat) return;
        if (pin.GeoLatitude < bounds._sw.lat) return;
        if (pin.GeoLongitude > bounds._ne.lng) return;
        if (pin.GeoLongitude < bounds._sw.lng) return;

        var isStore = pin.RestaurantType != null && (pin.RestaurantType.includes("store") || pin.RestaurantType.includes("Supermarket")
          || pin.RestaurantType.includes("shop")
          || pin.RestaurantType.includes("market") || pin.RestaurantType.includes("mall") || pin.RestaurantType.includes("Hypermarket")
        );
        var isHotel = pin.RestaurantType == "Hotel";
        var isOther = pin.RestaurantType != null && Others.includes(pin.RestaurantType);
        var isSelected = this.isSelected(pin.RestaurantType);
        if (!isSelected) return;
        if (!this._showHotels && isHotel) return;
        if (!this._showStores && isStore) return;
        if (!this._showOthers && isOther) return;
        selectedPins++;
        exportData += `${pin.GeoLatitude},${pin.GeoLongitude},${pin.Label}\r\n`;
        // trigger event to call a function back in angular
        var popup = new maplibre.Popup({ offset: 25 })
          .setHTML(`<h3>${pin.Label}</h3>`)
          .on('open', () => {
            this.pinSelected(pin);
          });
        var color = "#FF0000";
        if (isHotel) color = "#00FF00";
        if (isStore) color = "#0000FF";
        if (isOther) color = "#00FFFF";

        const marker = new Marker({ color: color })
          .setLngLat([parseFloat(pin.GeoLongitude), parseFloat(pin.GeoLatitude)])
          .setPopup(popup)
          .addTo(map);
        this.currentMarkers.push(marker);
      });
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