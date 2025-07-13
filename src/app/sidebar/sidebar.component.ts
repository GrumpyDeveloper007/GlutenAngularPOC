import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TopicGroup, PinSummary } from "../_model/model";
import { Input } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';
import { AnalyticsService, GlutenApiService } from '../_services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { tap } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, NgFor, HighlightPipe, MatProgressSpinnerModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  _selectedTopicGroup: TopicGroup | null = null;
  _selectedLanguage: string = "English";
  _pinCache: PinSummary[] = [];
  _loadingSummary: boolean = false;
  facebookLink = 'about:blank';


  @Input() set selectedLanguage(value: string | null) {
    if (value == null) return;
    this._selectedLanguage = value;
  }
  @Input() set selectedTopicGroup(value: TopicGroup | null) {

    this._selectedTopicGroup = value;
    // load summary
    this._loadingSummary = true;
  }

  get selectedTopicGroup(): TopicGroup | null {
    return this._selectedTopicGroup;
  }

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

  hasSummary() {
    if (this.selectedTopicGroup == null) return false;
    if (this.selectedTopicGroup.pinId == undefined) return true;//GM Pin
    if (this._selectedLanguage == "English") {
      return this.selectedTopicGroup.description != undefined;
    }
    if (this.selectedTopicGroup.languages != undefined) {
      return this.selectedTopicGroup.languages[this._selectedLanguage] != undefined;
    }
    return false;
  }

  summary() {
    if (this.selectedTopicGroup == null) return "";
    if (this.selectedTopicGroup.topics == null) return 'Pin generated from Google maps :' + this.selectedTopicGroup.description;
    if (this._selectedLanguage == "English") {
      return 'AI Generated : ' + this.selectedTopicGroup.description;
    }
    else {

      return 'AI Generated : ' + this.selectedTopicGroup.languages[this._selectedLanguage];
    }
  }

  dateOnly(date: Date) {
    let currentDate = new Date(date);
    return currentDate.toDateString();
  }

}
