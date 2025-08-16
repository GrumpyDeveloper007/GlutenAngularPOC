import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom, forkJoin, Observable, tap } from 'rxjs';
import { GMapsPin, TopicGroup, GroupData } from "../_model/model";
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
  groups: GroupData[] = [];
  allGroups: GroupData[] = [];
  totalPins = 0;
  _showHotels: boolean = true;
  _showStores: boolean = true;
  _showOthers: boolean = true;
  _showGMPins: boolean = true;
  _showChains: boolean = false;
  _showTemporarilyClosed: boolean = true;
  _selectedLanguage: string = "English";
  _selectedMap: string = "Open";
  searchText: string = "";
  userMovedMap: number = 0;
  lastMarker: L.Marker | null = null;
  lastIcon: L.Icon | L.DivIcon | null = null;
  mapBounds: L.LatLngBounds = new L.LatLngBounds([46.879966, -121.726909], [46.879966, -121.726909]);
  loaded = true;
  loadingData = false;
  firstShown = true;
  pinDetailsLoading = false;
  pinListLoading = false;
  stadiaTiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
    noWrap: true,
    minNativeZoom: 3,
    maxNativeZoom: 14,
    minZoom: 3,
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  openTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  mapTilerTiles = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=4XNqZU5WGeN8rGGyXkiP`, { //style URL
    noWrap: true,
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
    crossOrigin: true
  });

  markerGroup: L.LayerGroup = new L.LayerGroup();

  language: string = "English";

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

  @Input() set selectedLanguage(value: string) {
    this._selectedLanguage = value;
    if (this.selectedTopicGroup == null) return;
    if (this._selectedLanguage != this.language) {
      this.language = this._selectedLanguage;
    }
    this.pinSelected(this.selectedTopicGroup as TopicGroup);
  }

  @Input() set selectedMap(value: string) {
    if (this._selectedMap != value) {
      if (this._selectedMap == "Stadia" && this.map != undefined) this.map.removeLayer(this.stadiaTiles);
      if (this._selectedMap == "Open" && this.map != undefined) this.map.removeLayer(this.openTiles);
      this._selectedMap = value;
      if (this._selectedMap == "Stadia" && this.map != undefined) this.map.addLayer(this.stadiaTiles);
      if (this._selectedMap == "Open" && this.map != undefined) this.map.addLayer(this.openTiles);
      // Update map tiles
      console.log('tile', this._selectedMap);
    }
  }


  isRestaurantSelected(restaurantType: string): boolean {
    var result = false;
    if (this.pinService.isHotel(restaurantType)) return this._showHotels;
    if (this.pinService.isStore(restaurantType)) return this._showStores;
    if (this.pinService.isOther(restaurantType)) return this._showOthers;

    if (this.restaurants[0].Name == "All" && this.restaurants[0].Show) return true;

    this.restaurants.forEach(restaurant => {
      if (restaurant.Show === true) {
        if (restaurantType.toLowerCase() === restaurant.Name.toLowerCase()) {
          result = true;
        }
      }
    });
    return result;
  }

  isGroupSelected(pinTopicGroup: TopicGroup): boolean {
    var result = false;
    if (pinTopicGroup.topics == undefined) return true;

    for (const group of this.groups) {
      if (group.selected === true) {
        for (const pinGroup of pinTopicGroup.topics) {
          if (group.groupId === pinGroup.gId) {
            result = true;
            pinGroup.selected = true;
          }
          else {
            pinGroup.selected = false;
          }
        };
      }
    };
    return result;
  }

  // TODO:Write up?
  openListView(): void {
    this.searchInput.nativeElement.focus();
  }

  generateFBUrl(groupId: string): string {
    return "https://www.facebook.com/groups/" + groupId;
  }

  groupClick(groupId: string): void {
    this.gaService.trackEvent("Group selected:", groupId, "Map");
  }



  closeModal(): void {
    this.searchText = "";
    this.modalService.close();
  }

  locate(pin: (TopicGroup | GMapsPin)): void {
    var t = pin as TopicGroup;
    this.map?.flyTo({ lat: t.geoLatitude, lng: t.geoLongitude }, 15);
    this.pinSelected(pin);
    this.modalService.close();
  }

  loadPinDetails(pinId: number) {
    this.pinDetailsLoading = true;
    if (Number.isNaN(pinId)) return;
    this.apiService.getPinDetails(pinId, this._selectedLanguage).subscribe(data => {

      for (let key in this.pinCache) {
        let value = this.pinCache[key];
        this.pinDetailsLoading = false;
        // Use `key` and `value`
        value.forEach(pin => {
          if (pin.pinId == data[0].pinId) {
            if (pin.languages == undefined) pin.languages = {};
            pin.languages[this._selectedLanguage] = data[0].description;
            if (this._selectedLanguage == "English") {
              pin.description = data[0].description;
            }
            pin.mapsLink = data[0].mapsLink;
            pin.restaurantType = data[0].restaurantType;
            pin.price = data[0].price;
            pin.stars = data[0].stars;
            pin.isGF = data[0].isGF;
            pin.isC = data[0].isC;
            pin.isGFG = data[0].isGFG;
            pin.isTC = data[0].isTC;
            pin.topics = data[0].topics;
            if (pin.pinId != this.selectedTopicGroup?.pinId) {
              this.userMovedMap = 2;
              this.selectedTopicGroup = pin;
              this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
              this.map?.flyTo({ lat: pin.geoLatitude, lng: pin.geoLongitude }, 12, { animate: false });
            }
          }
        });
      }
    });
  }

  pinSelected(pin: (TopicGroup | GMapsPin)): void {
    /*
    var selectedIcon = L.icon({
      iconUrl: "/Empty.png",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
    });

    this.markerGroup.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer.options.title === pin.pinId.toString()) {
        console.log("setting marker");
        if (this.lastMarker != null && this.lastIcon != null) {
          this.lastMarker.setIcon(this.lastIcon);
          this.lastMarker.setZIndexOffset(0);
        }

        this.lastIcon = layer.getIcon();
        this.lastMarker = layer;
        layer.setIcon(selectedIcon);
        layer.setZIndexOffset(100);
      }
    });*/

    this.selectedTopicGroup = pin as TopicGroup;
    this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
    this.gaService.trackEvent("Pin click", this.selectedTopicGroup.label, "Map");
    this.gaService.trackEvent("Pin selected:" + this.selectedTopicGroup.label, this.selectedTopicGroup.label, "Map");
    if (pin.pinId == undefined) return;
    window.history.replaceState({}, '', `/places/${pin.pinId}`);
    //if (this.selectedTopicGroup.topics == null) return;//GM Pin

    if (pin.description != undefined && pin.description?.length > 0 && this._selectedLanguage == "English") return;
    //if (this._selectedLanguage != "English" && (this.selectedTopicGroup.languages == undefined || this.selectedTopicGroup.languages[this._selectedLanguage] == undefined)) return;

    this.loadPinDetails(pin.pinId);
    return;
  }

  SetMapToUserLocation(alwaysFly: boolean) {
    //console.log('home loc');
    this.locationService.getUserLocation()
      .then((loc) => {
        var location = loc;
        //console.log('fly to loc');
        if ((this.userMovedMap < 2 || alwaysFly)) {
          this.map?.setView([location.latitude, location.longitude], 14);
          if ((this.map === undefined)) return;
          L.circle([location.latitude, location.longitude], {
            radius: 10,
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.8
          }).addTo(this.map);
        }
      })
      .catch((err) => {
        console.debug(err);
      });
  }

  ngOnInit() {
    var location = { latitude: 35.6844, longitude: 139.753 };
    //http://leaflet-extras.github.io/leaflet-providers/preview/
    this.map = L.map('map').setView([location.latitude, location.longitude], 8).setMinZoom(3).setMaxZoom(18);
    /*L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=1b4b20af6bf5459b82658bc0d86c5b5a', {
      noWrap: true, attribution: '',
    }).addTo(this.map);*/
    this.openTiles.addTo(this.map);
    this.map.addLayer(this.markerGroup);
    //L.control.locate().addTo(this.map);
  }
  ngOnDestroy() {
  }
  async ngAfterViewInit() {
    if ((this.map === undefined)) return;
    restaurantTypes.forEach(restaurant => {
      var a = new Restaurant(true, restaurant);
      this.restaurants.push(a);
    });

    this.apiService.getGroups().subscribe(data => {
      this.allGroups = data;
      this.allGroups.forEach(p => p.selected = true);
    });

    var location = { latitude: 35.6844, longitude: 139.753 };
    try {
      var ipLocation = await firstValueFrom(this.apiService.getLocation(""))
      if (ipLocation != null && ipLocation.loc != null && ipLocation.loc != null) {
        var latlng = ipLocation.loc.split(',');
        location = { latitude: parseFloat(latlng[0]), longitude: parseFloat(latlng[1]) }
      }
    }
    catch { }

    this.SetMapToUserLocation(false);

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

  selectNoGroups(): void {
    this.allGroups.forEach(group => {
      group.selected = false;
    });
    this.showPinListView();
    this.loadMapPins();
  }

  selectAllGroups(): void {
    this.allGroups.forEach(group => {
      group.selected = true;
    });
    this.showPinListView();
    this.loadMapPins();
  }

  groupSelected() {
    // Make sure we load all the pins
    this.showPinListView();
    this.loadMapPins();
  }

  mapMoved(e: L.LeafletEvent) {
    if ((this.map === undefined)) return;
    this.userMovedMap++;
    this.loadMapPins();
  }

  loadMapPins() {
    const howLong = this.diagService.timer();
    if ((this.map === undefined)) return;

    // Trigger api calls
    var waitForDataLoad = false;
    const bounds = this.map.getBounds();
    const mapCenter = this.map.getCenter();
    var countryNames = this.mapDataService.getCountriesInView(bounds);
    var centerCountryNames = this.mapDataService.getCountriesInViewPoint(mapCenter);
    console.debug("Countries in view: " + countryNames);
    console.debug("Center Countries in view: " + centerCountryNames);
    const requests: Observable<any>[] = [];
    this.groups = [];
    for (let key in centerCountryNames) {
      let value = centerCountryNames[key];
      this.allGroups.forEach(g => {
        if (g.country == value) {
          if (g.geoLatitudeMin != 0) {
            if (g.geoLatitudeMin < mapCenter.lat
              && g.geoLatitudeMax > mapCenter.lat
              && g.geoLongitudeMin < mapCenter.lng
              && g.geoLongitudeMax > mapCenter.lng) {
              this.groups.push(g);
              //console.log("added group", g.country, value, g.name);
            }
            else {
              //console.log("geo skipped group", g.country, g, mapCenter);
            }
          }
          else {
            this.groups.push(g);
            //console.log("added group", g.country, g.name);
          }
        }
      });

      if (!(this.pendingCountries.includes(value))) {
        if (!(value in this.pinCache)) {
          // key does not exist
          this.pendingCountries.push(value);
          this.loadingData = true;
          waitForDataLoad = true;
          requests.push(this.apiService.getPins(value).pipe(
            tap(data => {
              this.pinCache[value] = data;
              this.gaService.trackEvent("Map Loaded:", value, "Map");
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
        // Get pin ID from URL
        const path = window.location.pathname;
        const pinId = path.split('/places/')[1];
        if (!Number.isNaN(pinId)) {
          this.loadPinDetails(Number.parseInt(pinId));
        }
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

  getActiveGroups() {
    return this.groups.sort((a, b) => {
      if (a.totalPins < b.totalPins) {
        return 1;
      }

      if (a.totalPins > b.totalPins) {
        return -1;
      }

      return 0;
    });
  }

  showMapPins(countryNames: string[]) {
    this.gaService.trackEvent("Show Map:", countryNames.toString(), "Map");
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
    var selectedIcon = L.icon({
      iconUrl: "/Empty.png",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
    });

    // Remove existing pins
    this.markerGroup.clearLayers();

    if (this.selectedTopicGroup != null && this.selectedTopicGroup.pinId == this.selectedTopicGroup?.pinId && !this.pinService.isInBoundsLeaflet(this.selectedTopicGroup.geoLatitude, this.selectedTopicGroup.geoLongitude, bounds)) {
      console.log("Pin moved out of view, deselecting");
      window.history.replaceState({}, '', `/`);
      this.selectedTopicGroup = null;
      this.selectedTopicGroupChange.emit(undefined);
    }

    pinTopics.forEach(pin => {
      try {
        if (pin == undefined) return;
        this.totalPins++;
        if (this.selectedPins >= 400) return;
        if (!this._showChains && !!pin.isC) return;
        if (!this._showTemporarilyClosed && !!pin.isTC) return;

        if (!this.pinService.isInBoundsLeaflet(pin.geoLatitude, pin.geoLongitude, bounds)) return;
        if (!this.isRestaurantSelected(pin.restaurantType)) return;
        if (!this.isGroupSelected(pin)) return;
        pinsToExport.push(pin);

        var color = this.pinService.getColor(pin);

        const marker = new L.Marker([pin.geoLatitude, pin.geoLongitude], {
          title: pin.pinId.toString()  // Store identifier for lookup
        })

        var icon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label);
        if (pin.pinId == this.selectedTopicGroup?.pinId) {
          this.lastIcon = icon;
          this.lastMarker = marker;
          marker.setIcon(selectedIcon);
          marker.setZIndexOffset(100);
        }
        else {
          marker.setIcon(icon);
        }
        marker.addEventListener('click', () => {
          if (this.lastMarker == marker) return;
          if (this.lastMarker != null && this.lastIcon != null) {
            this.lastMarker.setIcon(this.lastIcon);
            this.lastMarker.setZIndexOffset(0);
          }

          this.lastIcon = icon;
          this.lastMarker = marker;
          marker.setIcon(selectedIcon);
          marker.setZIndexOffset(100);
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
          if (!this.isRestaurantSelected(pin.restaurantType)) return;

          pinsToExport.push(pin);

          var color = "#7f7f7f";
          const marker = new L.Marker([parseFloat(pin.geoLatitude), parseFloat(pin.geoLongitude)])
          var icon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label);

          if (pin.pinId == this.selectedTopicGroup?.pinId) {
            this.lastIcon = icon;
            this.lastMarker = marker;
            marker.setIcon(selectedIcon);
            marker.setZIndexOffset(100);
          }
          else {
            marker.setIcon(icon);
          }

          marker.addEventListener('click', () => {
            if (this.lastMarker == marker) return;
            if (this.lastMarker != null && this.lastIcon != null) {
              this.lastMarker.setIcon(this.lastIcon);
              this.lastMarker.setZIndexOffset(0);
            }

            this.lastIcon = icon;
            this.lastMarker = marker;
            marker.setIcon(selectedIcon);
            marker.setZIndexOffset(100);

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
    if (!(this.map === undefined)) {
      const bounds = this.map.getBounds();
      var countryNames = this.mapDataService.getCountriesInView(bounds);


      for (let index in countryNames) {
        let countryName = countryNames[index];
        let countryPinList = this.pinCache[countryName];
        if (countryPinList.length == 0) continue;
        var found = false;
        for (let pin of countryPinList) {
          if ((pin.description == undefined || pin.description?.length == 0)) found = true;
        }

        if (!found) continue;
        this.pinListLoading = true;
        this.apiService.getPinDetailsCountry(countryName).subscribe(data => {

          this.pinListLoading = false;
          for (let newData of data) {
            for (let pin of countryPinList) {
              if (pin.pinId == newData.pinId) {
                if (pin.languages == undefined) pin.languages = {};
                pin.languages[this._selectedLanguage] = newData.description;
                //TODO: Support other languages in list view
                //if (this._selectedLanguage == "English") {
                pin.description = newData.description;
                //}
                pin.mapsLink = newData.mapsLink;
                pin.restaurantType = newData.restaurantType;
                pin.price = newData.price;
                pin.stars = newData.stars;
                pin.isGF = newData.isGF;
                pin.isC = newData.isC;
                pin.isGFG = newData.isGFG;
                pin.isTC = newData.isTC;
                pin.topics = newData.topics;
                break;
              }
            };
          };

          this.showMapPins(countryNames);
        });

      }

    }
  }
}

