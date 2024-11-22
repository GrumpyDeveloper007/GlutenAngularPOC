import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-mapfilters',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FormsModule],

  templateUrl: './mapfilters.component.html',
  styleUrl: './mapfilters.component.css',
})
export class MapfiltersComponent {
  @Output() optionsChange = new EventEmitter<FilterOptions>();
  private _options: FilterOptions = new FilterOptions(true, true, true);


  @Input() set showHotels(value: boolean) {
    if (this._options.ShowHotels != value) {
      this._options.ShowHotels = value;
      console.debug("Filter Hotels click :");
      var options: FilterOptions = new FilterOptions(this._options.ShowHotels, this._options.ShowStores, this._options.ShowOthers)
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

}

export class FilterOptions {
  constructor(
    public ShowHotels: boolean,
    public ShowStores: boolean,
    public ShowOthers: boolean
  ) { }
}