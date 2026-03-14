import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapLeafletComponent } from "../map.leaflet/map.component";
import { MapfiltersComponent } from "../mapfilters/mapfilters.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TopicGroup } from "../_model/model";
import { Restaurant } from "../_model/restaurant";
import { FilterOptions } from "../_model/filterOptions";
import { SiteApiService, GlutenApiService, GroupService, PinSelectionService } from '../_services';

@Component({
  selector: 'app-mapView',
  standalone: true,
  imports: [CommonModule, MapLeafletComponent, SidebarComponent, MapfiltersComponent],
  templateUrl: 'mapView.component.html',
  styleUrl: './mapView.component.css',
})
export class MapViewComponent {
  selectedTopicGroup: TopicGroup | null = null;
  showOptions: FilterOptions = new FilterOptions(true, true, true, false, false, true, false, "", false);
  restaurants: Restaurant[] = [];
  country: string | undefined;

  @ViewChild(MapLeafletComponent, { static: false }) child!: MapLeafletComponent;
  @Input('id') productId = '';


  constructor(
    private siteApiService: SiteApiService,
    private apiService: GlutenApiService,
    public groupService: GroupService,
    private pinSelectionService: PinSelectionService
  ) {
  }

  showListView() {
    this.child.loadDetailsForAllPinsInCountry();
  }

  showGroupsView() {
    this.child.loadMapPins();
  }

  countryChanged(country: string) {
    this.country = country;
    this.siteApiService.setSelectedCountry(country);
  }

  ngOnInit() {
    this.pinSelectionService.loadData();

    this.apiService.getGroups().subscribe(data => {
      this.groupService.setAllGroups(data);
    });
  }
}
