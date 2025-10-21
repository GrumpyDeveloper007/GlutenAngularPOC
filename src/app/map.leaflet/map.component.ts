import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom, forkJoin, Observable, tap } from 'rxjs';
import { GMapsPin, TopicGroup, GroupData, PinHighlight, PinTopicDetailDTO } from "../_model/model";
import { Restaurant } from "../_model/restaurant";
import { restaurantTypes } from "../_model/staticData";
import { ModalService, GlutenApiService, LocationService, MapDataService, PinService, DiagnosticService, AnalyticsService, GroupService } from '../_services';
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
  @Output() selectedCountryChange = new EventEmitter<string>();
  centreCountry: string | undefined;
  @Output() selectedTopicGroupChange = new EventEmitter<TopicGroup>();
  @ViewChild('map') mapContainer!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef;
  map: L.Map | undefined;
  selectedTopicGroup: TopicGroup | null = null;
  restaurants: Restaurant[] = [];
  pendingCountries: string[] = [];
  pinCache: { [id: string]: TopicGroup[]; } = {};
  gmPinCache: { [id: string]: GMapsPin[]; } = {};
  selectedPins = 0;
  pinsToExport: (TopicGroup | GMapsPin)[] = [];
  pinHightlight: PinHighlight[] = [];
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
  sortedGroups: GroupData[] = [];

  readonly MaxPinsOnScreen = 300;

  markerGroup: L.LayerGroup = new L.LayerGroup();

  language: string = "English";

  constructor(public sanitizer: DomSanitizer,
    protected modalService: ModalService, private http: HttpClient,
    private apiService: GlutenApiService,
    private locationService: LocationService,
    private mapDataService: MapDataService,
    public pinService: PinService,
    public groupService: GroupService,
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
      if (this._selectedMap == "Stadia" && this.map != undefined) this.map.removeLayer(this.mapDataService.stadiaTiles);
      if (this._selectedMap == "Open" && this.map != undefined) this.map.removeLayer(this.mapDataService.openTiles);
      this._selectedMap = value;
      if (this._selectedMap == "Stadia" && this.map != undefined) this.map.addLayer(this.mapDataService.stadiaTiles);
      if (this._selectedMap == "Open" && this.map != undefined) this.map.addLayer(this.mapDataService.openTiles);
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

  copyDtoToTopicGroup(pin: TopicGroup, dto: PinTopicDetailDTO, selectedLanguage: string) {
    if (pin.languages == undefined) pin.languages = {};
    pin.languages[this._selectedLanguage] = dto.description;
    if (this._selectedLanguage == "English") {
      pin.description = dto.description;
    }
    pin.mapsLink = dto.mapsLink;
    pin.restaurantType = dto.restaurantType;
    pin.price = dto.price;
    pin.stars = dto.stars;
    pin.isC = dto.isC;
    pin.isTC = dto.isTC;
    pin.topics = dto.topics;
    pin.rc = dto.rc;
    for (const pinGroup of pin.topics) {
      pinGroup.selected = true;
    }
  }

  loadPinDetails(pinId: number) {
    this.pinDetailsLoading = true;
    if (Number.isNaN(pinId)) return;
    this.apiService.getPinDetails(pinId, this._selectedLanguage).subscribe(data => {

      if (!(data[0].country in this.pinCache)) {
        // key does not exist
        this.pendingCountries.push(data[0].country);
        this.loadingData = true;
        this.apiService.getPins(data[0].country).subscribe(pinsData => {
          this.loadingData = false;
          this.pinCache[data[0].country] = pinsData;
          const index = this.pendingCountries.indexOf(data[0].country, 0);
          if (index > -1) {
            this.pendingCountries.splice(index, 1);
          }
          this.flyToPin(data[0]);
        });
      }
      else {
        this.flyToPin(data[0]);
      }
    });
  }

  flyToPin(data: PinTopicDetailDTO) {
    for (let key in this.pinCache) {
      let value = this.pinCache[key];
      this.pinDetailsLoading = false;
      // Use `key` and `value`
      value.forEach(pin => {
        if (pin.pinId == data.pinId) {
          this.copyDtoToTopicGroup(pin, data, this._selectedLanguage);

          if (pin.pinId != this.selectedTopicGroup?.pinId) {
            this.userMovedMap = 2;
            this.selectedTopicGroup = pin;
            this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
            this.map?.flyTo({ lat: pin.geoLatitude, lng: pin.geoLongitude }, 12, { animate: false });
          }
        }
      });
    }
  }

  flyToCountry(country: string) {
    const position = this.mapDataService.getCentrePointOfCountry(country);
    if (position != null) {
      this.map?.flyTo(position, 6, { animate: false });
    }
    else {
      window.history.replaceState({}, '', `/`);
    }
  }


  pinSelected(pin: (TopicGroup | GMapsPin)): void {
    this.selectedTopicGroup = pin as TopicGroup;
    this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
    this.gaService.trackEvent("Pin click", this.selectedTopicGroup.label, "Map");
    if (pin.pinId == undefined) return;
    window.history.replaceState({}, '', `/places/${pin.pinId}`);
    this.groupService.selectTopicsForCurrentlySelectedGroups(this.selectedTopicGroup)
    // Check that the full pin details has been loaded
    if (pin.description != undefined && pin.description?.length > 0 && this._selectedLanguage == "English") return;
    this.loadPinDetails(pin.pinId);
  }

  SetMapToUserLocation(alwaysFly: boolean) {
    this.locationService.setMapToUserLocation()
      .then((location) => {
        if ((this.userMovedMap < 2 || alwaysFly)) {
          if ((this.map === undefined)) return;
          this.map.setView([location.latitude, location.longitude], 14);
        }
      });
  }

  ngOnInit() {
    var location = { latitude: 35.6844, longitude: 139.753 };
    this.map = L.map('map').setView([location.latitude, location.longitude], 8).setMinZoom(3).setMaxZoom(18);
    this.mapDataService.openTiles.addTo(this.map);
    this.map.addLayer(this.markerGroup);
    this.map.addLayer(this.locationService.locationLayer);
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
      this.groupService.setAllGroups(data);
    });

    this.apiService.getPinHightlight('').subscribe(data => {
      this.pinHightlight = data ?? [];
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
    this.locationService.startLocationWatching();

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

    // Add this after the map is initialized
    if (this.firstShown) {
      // Get pin ID from URL
      const path = window.location.pathname;
      const pathParts = path.split('/');
      if (pathParts.length == 3 && pathParts[1] == 'c') {
        {
          this.firstShown = false;
          const country = decodeURI(pathParts[2]);
          console.log("fly to country", country);
          this.flyToCountry(country);
          this.map.invalidateSize();
        }
      }
    }

    this.loadMapPins();
    this.loadDetailsForAllPinsInCountry();
  }

  selectNoGroups(): void {
    this.groupService.setAllGroupState(false);
    this.loadMapPins();
  }

  selectAllGroups(): void {
    this.groupService.setAllGroupState(true);
    this.loadMapPins();
  }

  groupSelected() {
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
    const mapCenter = this.map.getCenter();
    var countryNames = this.getCountriesInViewWithCentreCountryFirst(false);
    var centerCountryNames = this.getCountriesInViewWithCentreCountryFirst(true);
    //console.debug("Countries in view: " + countryNames);
    console.debug("Center Countries in view: " + centerCountryNames);
    this.gaService.trackEvent("Show Map:", centerCountryNames.toString(), "Map");
    const requests: Observable<any>[] = [];
    this.groupService.resetActiveGroupList();
    for (let key in centerCountryNames) {
      let value = centerCountryNames[key];
      this.groupService.addGroupsBasedOnLocation(value, mapCenter);

      if (!(this.pendingCountries.includes(value))) {
        if (!(value in this.pinCache)) {
          // key does not exist
          this.pendingCountries.push(value);
          this.loadingData = true;
          waitForDataLoad = true;
          requests.push(this.apiService.getPins(value).pipe(
            tap(data => {
              this.pinCache[value] = data;
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
              this.gmPinCache[value] = data ?? [];
            })));
        }
      }
    }

    forkJoin(requests).subscribe(_ => {
      // all observables have been completed
      //console.debug("Loading data join :", howLong.ms);
      if (this.pendingCountries.length == 0) {
        //console.debug("Loading data complete :", howLong.ms);
        this.loadingData = false;
      }
      // Add this after the map is initialized
      if (this.firstShown) {
        this.firstShown = false;
        if ((this.map === undefined)) return;
        this.map.invalidateSize();
        // Get pin ID from URL
        const path = window.location.pathname;
        const pathParts = path.split('/');
        //console.log("path", path.split('/'));
        if (pathParts.length == 3 && pathParts[1] == 'places') {
          // places/
          const pinId = pathParts[2];
          if (Number.isInteger(pinId)) {
            this.loadPinDetails(Number.parseInt(pinId));
          }
        }
      }

      // Refresh country names to ensure we have the latest 
      countryNames = this.getCountriesInViewWithCentreCountryFirst(false);
      this.showMapPins(countryNames);
    });

    if (!waitForDataLoad) {
      this.showMapPins(countryNames);
    }
  }

  getCountriesInViewWithCentreCountryFirst(centreOnly: boolean): string[] {
    let countryNames: string[] = [];
    if (!(this.map === undefined)) {
      const mapCenter = this.map.getCenter();
      countryNames = this.mapDataService.getCountriesInViewPoint(mapCenter);

      var centerStateNames = this.mapDataService.getStatesInViewPoint(mapCenter);
      centerStateNames.forEach(key => {
        countryNames.push("United States" + key);
      });

      if (!centreOnly) {
        const bounds = this.map.getBounds();
        var tempCountryNames = this.mapDataService.getCountriesInView(bounds);
        tempCountryNames.forEach(key => {
          if (countryNames?.includes(key)) return;
          countryNames.push(key);
        });

        var stateNames = this.mapDataService.getStatesInView(bounds);
        stateNames.forEach(key => {
          if (countryNames?.includes("United States" + key)) return;
          countryNames.push("United States" + key);
        });
      }
      countryNames = countryNames.filter(item => item != "United States")
    }

    if (this.centreCountry != countryNames[0]) {
      this.centreCountry = countryNames[0];
      this.selectedCountryChange.emit(this.centreCountry);
    }

    return countryNames;
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
    this.pinsToExport = [];
    var pinsToExport: (TopicGroup | GMapsPin)[] = [];
    this.selectedPins = 0;
    this.totalPins = 0;
    var iconClassName = '';

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
      //console.log("Pin moved out of view, deselecting");
      window.history.replaceState({}, '', `/`);
      this.selectedTopicGroup = null;
      this.selectedTopicGroupChange.emit(undefined);
    }

    pinTopics.forEach(pin => {
      try {
        if (pin == undefined) return;
        this.totalPins++;
        if (!this.groupService.isGroupSelected(pin)) return;
        if (this.selectedPins >= this.MaxPinsOnScreen && !(pin.pinId == this.selectedTopicGroup?.pinId)) return;
        if (!this._showChains && !!pin.isC) return;
        if (!this._showTemporarilyClosed && !!pin.isTC) return;
        if (!this.pinService.isInBoundsLeaflet(pin.geoLatitude, pin.geoLongitude, bounds)) return;
        if (!this.isRestaurantSelected(pin.restaurantType)) return;
        pinsToExport.push(pin);
        this.groupService.updateGroupLocalPinCount(pin);

        var color = this.pinService.getColor(pin);

        const marker = new L.Marker([pin.geoLatitude, pin.geoLongitude], {
          title: pin.pinId.toString()  // Store identifier for lookup
        })

        const selectedPinHighlight = this.pinHightlight.find(u => u.pinId === pin.pinId);

        let effectClass = '';
        if (pin.isC) effectClass = 'pinLowlight';
        if (selectedPinHighlight) {
          effectClass = `pinHighlight${selectedPinHighlight.highlightEffect}`;
          if (this.selectedTopicGroup === null && selectedPinHighlight.autoSelect) {
            //TODO: Test - this.loadPinDetails(pin.pinId);
          }
        }

        var icon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label, effectClass);
        if (pin.pinId == this.selectedTopicGroup?.pinId) {
          selectedIcon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label, 'pinHighlight');
          this.lastIcon = icon;
          this.lastMarker = marker;
          marker.setIcon(selectedIcon);
          marker.setZIndexOffset(1000);
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

          selectedIcon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label, 'pinHighlight');
          this.lastIcon = icon;
          this.lastMarker = marker;
          marker.setIcon(selectedIcon);
          marker.setZIndexOffset(1000);
          this.pinSelected(pin);
        })

        marker.addTo(this.markerGroup);
        this.selectedPins++;
      } catch (e) {
        console.error("Error adding pin to map", e);
      }
    });

    if (this._showGMPins) {
      gmPins.forEach(pin => {
        try {
          if (pin == undefined) return;
          this.totalPins++;
          if (this.selectedPins >= this.MaxPinsOnScreen) return;
          if (!this.pinService.isInBoundsLeaflet(parseFloat(pin.geoLatitude), parseFloat(pin.geoLongitude), bounds)) return;
          if (!this.isRestaurantSelected(pin.restaurantType)) return;

          pinsToExport.push(pin);

          var color = "#7f7f7f";
          const marker = new L.Marker([parseFloat(pin.geoLatitude), parseFloat(pin.geoLongitude)])
          var icon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label, '');

          if (pin.pinId == this.selectedTopicGroup?.pinId) {
            selectedIcon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label, 'pinHighlight');
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

            selectedIcon = this.pinService.getMarkerIcon(color, pin.restaurantType, pin.label, 'pinHighlight');
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

    this.sortedGroups = this.groupService.sortGroups();

    this.pinsToExport = pinsToExport.sort((a, a2) => {
      if (a.label > a2.label) {
        return 1;
      }

      if (a.label < a2.label) {
        return -1;
      }

      return 0;
    });
  }

  // Triggered by map filters through app.component
  loadDetailsForAllPinsInCountry(): void {
    if (!(this.map === undefined)) {
      var countryNames = this.getCountriesInViewWithCentreCountryFirst(true);

      for (let index in countryNames) {
        let countryName = countryNames[index];

        if (!this.shouldLoadPinDetailsFor(countryName)) continue;

        this.pinListLoading = true;
        this.apiService.getPinDetailsCountry(countryName).subscribe(data => {

          this.pinListLoading = false;
          let countryPinList = this.pinCache[countryName];
          if (countryPinList == undefined) return;

          const pinMap = new Map(countryPinList.map(pin => [pin.pinId, pin]));

          for (let newData of data) {
            const pin = pinMap.get(newData.pinId);
            if (pin == undefined) {
              // TODO: This can happen when the cache is out of sync
              console.error("Pin not found", newData.pinId);
              continue;
            }
            this.copyDtoToTopicGroup(pin, newData, "English");
          };
        });

      }

    }
  }

  shouldLoadPinDetailsFor(countryName: string): boolean {
    let countryPinList = this.pinCache[countryName];
    if (countryPinList == undefined) {
      //console.log("countryPinList is undefined", countryName);
      return true;
    }
    if (countryPinList.length == 0) return true;
    var isPinsWithoutDetails = false;
    for (let pin of countryPinList) {
      if ((pin.topics == undefined || pin.topics.length == 0)) {
        isPinsWithoutDetails = true;
      }
    }
    return isPinsWithoutDetails;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'FB.png';
  }
}

