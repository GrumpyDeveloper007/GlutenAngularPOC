import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
//import { MapComponent } from "./map/map.component";
import { MapLeafletComponent } from "./map.leaflet/map.component";
import { MapfiltersComponent, FilterOptions } from "./mapfilters/mapfilters.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopicGroup } from "./_model/model";

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
}
