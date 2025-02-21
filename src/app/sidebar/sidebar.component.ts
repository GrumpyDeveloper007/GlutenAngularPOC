import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TopicGroup } from "../_model/model";
import { Input } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';
import { AnalyticsService } from '../_services';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, NgFor, HighlightPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() selectedTopicGroup: TopicGroup | null = null;
  facebookLink = 'about:blank';

  constructor(
    private gaService: AnalyticsService) { }

  linkClick(url: string) {
    this.gaService.trackEvent("FB Link Click:", url, "Map");
  }

  mapLinkClick(url: string) {
    this.gaService.trackEvent("Map Link Click:", url, "Map");
  }

  summary() {
    if (this.selectedTopicGroup == null) return "";
    if (this.selectedTopicGroup.topics == null) return 'Pin generated from Google maps :' + this.selectedTopicGroup.description;
    return 'AI Generated :' + this.selectedTopicGroup.description;
  }

  dateOnly(date: Date) {
    let currentDate = new Date(date);
    return currentDate.toDateString();
  }

}
