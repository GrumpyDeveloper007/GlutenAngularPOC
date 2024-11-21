import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { MapComponent } from "./map/map.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { Topic, TopicGroup } from "../app/model/model";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, MapComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gluten-angular-map';
  selectedTopicGroup: TopicGroup | null = null;

  topicGroupUpdated(topicGroup: TopicGroup): void {
    this.selectedTopicGroup = topicGroup;
  }
}
