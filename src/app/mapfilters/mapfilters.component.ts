import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ModalService, AnalyticsService } from '../_services';
import { ModalComponent } from '../_components';
import { Restaurant } from "../_model/restaurant";
import { restaurantTypes } from "../_model/staticData";
import { FilterOptions } from "../_model/filterOptions";

@Component({
  selector: 'app-mapfilters',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FormsModule,
    ModalComponent,
    NgFor,
  ],


  templateUrl: './mapfilters.component.html',
  styleUrl: './mapfilters.component.css',
})
export class MapfiltersComponent {
  @Output() optionsChange = new EventEmitter<FilterOptions>();
  @Output() restaurantChange = new EventEmitter<Restaurant[]>();
  @Output() listViewOpenChange = new EventEmitter<number>();
  @Output() languageChange = new EventEmitter<string>();
  @Output() mapChange = new EventEmitter<string>();
  private _options: FilterOptions = new FilterOptions(true, true, true, true, false, true, false, "English", "Open");
  restaurants: Restaurant[] = [];


  constructor(
    protected modalService: ModalService,
    private gaService: AnalyticsService) { }

  @Input() set selectedLanguage(value: string) {
    if (this._options.SelectedLanguage != value) {
      this._options.SelectedLanguage = value;
      this.optionsChange.emit(this._options);
    }
  }
  get selectedLanguage(): string {
    return this._options.SelectedLanguage;
  }

  @Input() set selectedMap(value: string) {
    if (this._options.SelectedMap != value) {
      this._options.SelectedMap = value;
      this.optionsChange.emit(this._options);
    }
  }
  get selectedMap(): string {
    return this._options.SelectedMap;
  }

  @Input() set showHotels(value: boolean) {
    if (this._options.ShowHotels != value) {
      this._options.ShowHotels = value;
      console.debug("Filter Hotels click :");
      var options: FilterOptions = new FilterOptions(this._options.ShowHotels, this._options.ShowStores, this._options.ShowOthers, this._options.ShowGMPins, this._options.ShowChainPins, this._options.ShowNonGFGroupPins, this._options.ShowTemporarilyClosed, this._options.SelectedLanguage, this._options.SelectedMap)
      this.optionsChange.emit(options);
    }
  }
  get showHotels(): boolean {
    return this._options.ShowHotels;
  }

  @Input() set showStores(value: boolean) {
    if (this._options.ShowStores != value) {
      this._options.ShowStores = value;
      this.optionsChange.emit(this._options);
    }
  }
  get showStores(): boolean {
    return this._options.ShowStores;
  }

  @Input() set showOthers(value: boolean) {
    if (this._options.ShowOthers != value) {
      this._options.ShowOthers = value;
      this.optionsChange.emit(this._options);
    }
  }
  get showOthers(): boolean {
    return this._options.ShowOthers;
  }

  @Input() set showGMPins(value: boolean) {
    if (this._options.ShowGMPins != value) {
      this._options.ShowGMPins = value;
      this.optionsChange.emit(this._options);
    }
  }
  get showGMPins(): boolean {
    return this._options.ShowGMPins;
  }
  get showChains(): boolean {
    return this._options.ShowChainPins;
  }

  @Input() set showChains(value: boolean) {
    if (this._options.ShowChainPins != value) {
      this._options.ShowChainPins = value;
      this.optionsChange.emit(this._options);
    }
  }
  get showTemporarilyClosed(): boolean {
    return this._options.ShowTemporarilyClosed;
  }

  @Input() set showTemporarilyClosed(value: boolean) {
    if (this._options.ShowTemporarilyClosed != value) {
      this._options.ShowTemporarilyClosed = value;
      this.optionsChange.emit(this._options);
    }
  }

  showRestaurantList(): void {
    this.modalService.open('modal-1')
    this.gaService.trackEvent("Restaurant List", "Open", "MapFilters");
  }

  showPinListView(): void {
    this.listViewOpenChange.emit(1);
    this.modalService.open('modal-listView')
    this.gaService.trackEvent("Pin List", "Open", "MapFilters");
  }
  showGroupListView(): void {
    this.modalService.open('modal-groups')
    this.gaService.trackEvent("Group List", "Open", "MapFilters");
  }
  showGlobalGroupListView(): void {
    this.modalService.open('modal-global-groups')
    this.gaService.trackEvent("Global Group List", "Open", "MapFilters");
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

  selectComplete(): void {
    this.modalService.close();
    this.restaurantChange.emit([...this.restaurants]);
  }

  onLanguageChange() {
    this.languageChange.emit(this.selectedLanguage);
    this.gaService.trackEvent("Language Changed", this.selectedLanguage, "MapFilters");
  }

  onMapChange() {
    this.mapChange.emit(this.selectedMap);
    this.gaService.trackEvent("MapProvider Changed", this.selectedMap, "MapFilters");
  }


  ngOnInit() {
    restaurantTypes.forEach(restaurant => {
      var a = new Restaurant(true, restaurant);
      this.restaurants.push(a);
    });
  }

}

