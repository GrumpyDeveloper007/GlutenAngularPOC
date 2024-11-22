import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myData from './TopicsExport.json';
import { Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Topic, TopicGroup } from "../model/model";
import { EventEmitter, Output, Input } from '@angular/core';
import { FilterOptions } from "../mapfilters/mapfilters.component";

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() selectedTopicGroupChange = new EventEmitter<TopicGroup>();
  @ViewChild('map') mapContainer!: ElementRef<HTMLElement>;
  map: Map | undefined;
  selectedTopicGroup: TopicGroup | null = null;
  currentMarkers: Marker[] = [];

  constructor(private renderer: Renderer2, public sanitizer: DomSanitizer) { }

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


  pinSelected(pin: any): void {
    this.selectedTopicGroup = pin as TopicGroup;
    this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
    return;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
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


    console.debug("Total pins :" + myData.length);
    console.debug("is undefined :" + (this.map === undefined));
    console.debug("map :" + this.map);
    this.loadMapPins();
  }

  loadMapPins() {
    var pinTopics: any[] = myData;
    var map: Map;
    if (!(this.map === undefined)) {
      console.debug("Updating pins");
      map = this.map

      var Others: Array<string> = ['Train station',
        'Airports',
        'Sightseeing tour agency',
        'Laundromat',
        'Historical landmark',
        'Island',
        'Electronics manufacturer',
        'Corporate office',
        'Theme park',
        'Subway station',
        'Food manufacturer',
        'Art museum',
        'International airport',
        'Airport',
        'Garden',
        'Cinema',
        'Manufacturer',
        'Observation deck',
        'Mountain peak',
        'Amusement park',
        'Bridge',
        'Soy sauce maker',
        'Housing development',
        'Massage spa',
        'Waterfall',
        'Delivery service',
        'Water treatment supplier',
        'River',
        'Event venue',
        'Museum',
        'Florist',
        'Park',
        'Tourist attraction',
        'Business park',
        'Hair salon',
        'Holiday apartment',
        'Car racing track',
        'Language school',
        'Host club',
        'Shinto shrine',
        'Cultural center',
        'Foreign consulate',
        'Non-profit organization',
        'Truck parts supplier',
        'Gift shop',
        'Lake',
        'Spa',
        'Festival',
        'Beach',
        'Dog trainer',
        'Concert hall',
        'Tour operator',
        'Art gallery',
        'Health and beauty shop'];

      pinTopics.forEach(pin => {

        var isStore = pin.RestaurantType != null && (pin.RestaurantType.includes("store") || pin.RestaurantType.includes("Supermarket")
          || pin.RestaurantType.includes("market") || pin.RestaurantType.includes("mall") || pin.RestaurantType.includes("Hypermarket")
        );
        var isHotel = pin.RestaurantType == "Hotel";
        var isOther = pin.RestaurantType != null && Others.includes(pin.RestaurantType);
        if (!(
          (!this._showHotels && isHotel)
          || (!this._showStores && isStore)
          || (!this._showOthers && isOther)
        )) {
          // trigger event to call a function back in angular
          var popup = new maplibre.Popup({ offset: 25 })
            .setHTML(`<h3>${pin.Label}</h3>`)
            .on('open', () => {
              this.pinSelected(pin);
            });

          const marker = new Marker({ color: "#FF0000" })
            .setLngLat([parseFloat(pin.GeoLongitude), parseFloat(pin.GeoLatatude)])
            .setPopup(popup)
            .addTo(map);
          this.currentMarkers.push(marker);
        }
      });
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }

}