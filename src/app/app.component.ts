import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { MapLeafletComponent } from "./map.leaflet/map.component";
import { MapfiltersComponent } from "./mapfilters/mapfilters.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopicGroup } from "./_model/model";
import { Restaurant } from "./_model/restaurant";
import { FilterOptions } from "./_model/filterOptions";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapLeafletComponent, NavbarComponent, SidebarComponent, MapfiltersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gluten-angular-map';
  selectedTopicGroup: TopicGroup | null = null;
  showOptions: FilterOptions = new FilterOptions(true, true, true, true);
  restaurants: Restaurant[] = [];
}
