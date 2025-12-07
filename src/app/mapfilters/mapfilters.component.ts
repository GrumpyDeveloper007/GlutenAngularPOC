import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ModalService } from '../_services';
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
  private _options: FilterOptions = new FilterOptions(true, true, true, true, false, true);
  restaurants: Restaurant[] = [];

  constructor(
    protected modalService: ModalService, private cd: ChangeDetectorRef) { }

  @Input() set showHotels(value: boolean) {
    if (this._options.ShowHotels != value) {
      this._options.ShowHotels = value;
      console.debug("Filter Hotels click :");
      var options: FilterOptions = new FilterOptions(this._options.ShowHotels, this._options.ShowStores, this._options.ShowOthers, this._options.ShowGMPins, this._options.ShowChainPins, this._options.ShowNonGFGroupPins)
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
      console.debug("Filter Stores click :");
    }
  }
  get showStores(): boolean {
    return this._options.ShowStores;
  }

  @Input() set showOthers(value: boolean) {
    if (this._options.ShowOthers != value) {
      this._options.ShowOthers = value;
      this.optionsChange.emit(this._options);
      console.debug("Filter Others click :");
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
  get showChains(): boolean {
    return this._options.ShowChainPins;
  }

  @Input() set showChains(value: boolean) {
    if (this._options.ShowChainPins != value) {
      this._options.ShowChainPins = value;
      this.optionsChange.emit(this._options);
    }
  }
  get showGMPins(): boolean {
    return this._options.ShowGMPins;
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
    //this.cd.detectChanges();
    console.log("Select Complete");
    this.restaurantChange.emit([...this.restaurants]);
  }

  ngOnInit() {
    restaurantTypes.forEach(restaurant => {
      var a = new Restaurant(true, restaurant);
      this.restaurants.push(a);
    });
  }

}

