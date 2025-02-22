import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TopicGroup, PinSummary } from "../_model/model";
import { Input } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';
import { AnalyticsService, GlutenApiService } from '../_services';
import { tap } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, NgFor, HighlightPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  _selectedTopicGroup: TopicGroup | null = null;
  _pinCache: PinSummary[] = [];
  _loadingSummary: boolean = false;
  @Input() set selectedTopicGroup(value: TopicGroup | null) {

    this._selectedTopicGroup = value;
    // load summary
    this._loadingSummary = true;
    /*if (this._selectedTopicGroup == null) return;
    this.apiService.getPinDescription(this._selectedTopicGroup?.pinId, "EN").pipe(
      tap(data => {
        this._pinCache.push(data);
        this._loadingSummary = false;
      }))
*/
  }

  get selectedTopicGroup(): TopicGroup | null {

    return this._selectedTopicGroup;

  }
  facebookLink = 'about:blank';

  constructor(
    private gaService: AnalyticsService,
    private apiService: GlutenApiService
  ) { }

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
