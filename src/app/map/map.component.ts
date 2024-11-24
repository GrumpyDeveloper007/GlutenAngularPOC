import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myData from './TopicsExport.json';
import { Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TopicGroup } from "../model/model";
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

  restaurantTypes: string[] = [
    'All',
    'American restaurant',
    'Art cafe',
    'Asian fusion restaurant',
    'Asian restaurant',
    'Australian restaurant',
    'Bakery',
    'Bar',
    'Bar &amp; grill',
    'Barbecue restaurant',
    'Belgian restaurant',
    'Bistro',
    'Brazilian restaurant',
    'Breakfast restaurant',
    'Brewery',
    'Brewpub',
    'British restaurant',
    'Brunch restaurant',
    'Buddhist temple',
    'Buffet restaurant',
    'Cafe',
    'Cafeteria',
    'Charcuterie',
    'Chicken restaurant',
    'Chinese restaurant',
    'Cocktail bar',
    'Coffee roasters',
    'Conveyor belt sushi restaurant',
    'Crab house',
    'Creative cuisine restaurant',
    'Creperie',
    'Deli',
    'Dessert restaurant',
    'Dim sum restaurant',
    'Dog cafe',
    'Dumpling restaurant',
    'Falafel restaurant',
    'Family restaurant',
    'Fast food restaurant',
    'Fine dining restaurant',
    'Fish &amp; chips restaurant',
    'Fish restaurant',
    'Food court',
    'French restaurant',
    'Fried chicken takeaway',
    'Fruit parlor',
    'Fusion restaurant',
    'Gluten-free restaurant',
    'Greek restaurant',
    'Gyudon restaurant',
    'Hamburger restaurant',
    'Hawaiian restaurant',
    'Hawker stall',
    'Health food restaurant',
    'Hot pot restaurant',
    'Hunan restaurant',
    'Indian restaurant',
    'Irish pub',
    'Italian restaurant',
    'Izakaya restaurant',
    'Japanese curry restaurant',
    'Japanese delicatessen',
    'Japanese restaurant',
    'Japanese steakhouse',
    'Japanese sweets restaurant',
    'Japanized western restaurant',
    'Kaiseki restaurant',
    'Konditorei',
    'Korean barbecue restaurant',
    'Korean restaurant',
    'Kushiyaki restaurant',
    'Kyoto style Japanese restaurant',
    'Lebensmittelhändler',
    'Macrobiotic restaurant',
    'Matchaa year ago',
    'Meat dish restaurant',
    'Mexican restaurant',
    'Modern izakaya restaurant',
    'Mutton barbecue restaurant',
    'Nepalese restaurant',
    'New American restaurant',
    'Obanzai restaurant',
    'Okonomiyaki restaurant',
    'Organic restaurant',
    'Oyster bar restaurant',
    'Pakistani restaurant',
    'Pancake restaurant',
    'Patisserie',
    'Persian restaurant',
    'Pizza restaurant',
    'Pizza takeaway',
    'Pub',
    'Ramen restaurant',
    'Restauracja japońska (okonomiyaki)',
    'Restaurant',
    'Rice restaurant',
    'Ristorante italiano',
    'Sake brewery',
    'Samgyetang restaurant',
    'Seafood donburi restaurant',
    'Seafood restaurant',
    'Shabu-shabu restaurant',
    'Sichuan restaurant',
    'Singaporean restaurant',
    'Snack bar',
    'South Indian restaurant',
    'Southeast Asian restaurant',
    'Sports bar',
    'Steak house',
    'Sukiyaki and Shabu Shabu restaurant',
    'Sushi restaurant',
    'Sushirestaurant med transportbånd',
    'Swiss restaurant',
    'Syokudo and Teishoku restaurant',
    'Taco restaurant',
    'Taiwanese restaurant',
    'Take Away Restaurant',
    'Tapas bar',
    'Tapas restaurant',
    'Tea house',
    'Tempura restaurant',
    'Teppanyaki restaurant',
    'Teppanyaki-Restaurant',
    'Tex-Mex restaurant',
    'Thai restaurant',
    'Tofu restaurant',
    'Tonkatsu restaurant',
    'Traditional restaurant',
    'Traditional teahouse',
    'Udon noodle restaurant',
    'Unagi restaurant',
    'Vegan restaurant',
    'Vegetarian cafe and deli',
    'Vegetarian restaurant',
    'Vietnamese restaurant',
    'Warehouse club',
    'West African restaurant',
    'Western restaurant',
    'Wholesale bakery',
    'Yakatabune',
    'Yakiniku restaurant',
    'Yakitori restaurant',
  ];

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
    this.currentMarkers.forEach((marker: Marker) => marker.remove())
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
    this.restaurantTypes.forEach(restaurant => {
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

      var selectedPins = 0;
      pinTopics.forEach(pin => {

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
      });
      console.debug("selected pins :" + selectedPins);
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