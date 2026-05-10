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
  @Output() groupViewOpenChange = new EventEmitter<number>();
  @Output() mapChange = new EventEmitter<string>();
  private options: FilterOptions = new FilterOptions(true, true, true, false, false, true, false, "Open", false);
  restaurants: Restaurant[] = [];
  country: string | undefined;



  constructor(
    protected modalService: ModalService,
    private gaService: AnalyticsService) { }

  @Input() set selectedCountry(value: string | undefined) {
    this.country = value;
  }

  @Input() set selectedMap(value: string) {
    if (this.options.SelectedMap != value) {
      this.options.SelectedMap = value;
      this.optionsChange.emit(this.options);
    }
  }
  get selectedMap(): string {
    return this.options.SelectedMap;
  }

  @Input() set showHotels(value: boolean) {
    if (this.options.ShowHotels != value) {
      this.options.ShowHotels = value;
      this.optionsChange.emit(this.options);
    }
  }
  get showHotels(): boolean {
    return this.options.ShowHotels;
  }

  @Input() set showStores(value: boolean) {
    if (this.options.ShowStores != value) {
      this.options.ShowStores = value;
      this.optionsChange.emit(this.options);
    }
  }
  get showStores(): boolean {
    return this.options.ShowStores;
  }

  @Input() set showOthers(value: boolean) {
    if (this.options.ShowOthers != value) {
      this.options.ShowOthers = value;
      this.optionsChange.emit(this.options);
    }
  }
  get showOthers(): boolean {
    return this.options.ShowOthers;
  }

  @Input() set showGMPins(value: boolean) {
    if (this.options.ShowGMPins != value) {
      this.options.ShowGMPins = value;
      this.optionsChange.emit(this.options);
    }
  }
  get showGMPins(): boolean {
    return this.options.ShowGMPins;
  }
  get showChains(): boolean {
    return this.options.ShowChainPins;
  }

  @Input() set showChains(value: boolean) {
    if (this.options.ShowChainPins != value) {
      this.options.ShowChainPins = value;
      this.optionsChange.emit(this.options);
    }
  }

  get showOpenNow(): boolean {
    return this.options.ShowOpenNow;
  }
  @Input() set showOpenNow(value: boolean) {
    if (this.options.ShowOpenNow != value) {
      this.options.ShowOpenNow = value;
      this.optionsChange.emit(this.options);
    }
  }

  get showTemporarilyClosed(): boolean {
    return this.options.ShowTemporarilyClosed;
  }

  @Input() set showTemporarilyClosed(value: boolean) {
    if (this.options.ShowTemporarilyClosed != value) {
      this.options.ShowTemporarilyClosed = value;
      this.optionsChange.emit(this.options);
    }
  }

  showRestaurantList(): void {
    this.modalService.open('modal-1')
    this.gaService.trackEvent("Restaurant List", this.country ?? "", "MapFilters");
  }

  showMapFilters(): void {
    this.modalService.open('modal-mapFilters')
  }

  showPinListView(): void {
    this.listViewOpenChange.emit(1);
    this.modalService.open('modal-listView')
    this.gaService.trackEvent("Pin List", this.country ?? "", "MapFilters");
  }
  showGroupListView(): void {
    this.groupViewOpenChange.emit(1);
    this.modalService.open('modal-groups')
    this.gaService.trackEvent("Group List", this.country ?? "", "MapFilters");
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

  selectCompleteRestaurantTypes(): void {
    this.modalService.close();
    this.restaurantChange.emit([...this.restaurants]);
  }

  selectComplete(): void {
    this.modalService.close();
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

