import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TopicGroup, PinSummary, Topic, CountryMeta } from "../_model/model";
import { Input } from '@angular/core';
import { HighlightPipe } from '../highlight.pipe';
import { AnalyticsService, SiteApiService } from '../_services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  _country: string | undefined;
  facebookLink = 'about:blank';
  _selectedCountryMeta: CountryMeta | undefined;

  @Input() set selectedCountry(value: string | undefined) {
    this._country = value;
    this._selectedCountryMeta = this.siteApiService.getCountryMeta();
  }

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
    private siteApiService: SiteApiService,

  ) { }

  ngOnInit() {
  }


  linkClick(url: string) {
    this.gaService.trackEvent("FB Link Click Count:", this._country ?? "", "Map");
  }

  mapLinkClick(url: string) {
    this.gaService.trackEvent("Map Link Click:", this._country ?? "", "Map");
  }

  askChatGPTClick(url: string) {
    this.gaService.trackEvent("Ask ChatGPT Count:", this._country ?? "", "Map");
  }

  usefulClick(url: string) {
    this.gaService.trackEvent("Useful Click:", url, "Map");
  }


  buildFbUrl(item: Topic) {
    return `https://www.facebook.com/groups/${item.gId}/permalink/${item.lId}`;
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
      if (this.selectedTopicGroup.description.length == 0) return '';
      return 'AI Generated : ' + this.selectedTopicGroup.description;
    }
    else {
      if (this.selectedTopicGroup.languages[this._selectedLanguage].length == 0) return '';
      return 'AI Generated : ' + this.selectedTopicGroup.languages[this._selectedLanguage];
    }
  }

  encodeURI(label: string): string {
    return encodeURIComponent(label);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'FB.png';
  }

  dateOnly(date: Date) {
    let currentDate = new Date(date);
    return currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  removeStars(item: TopicGroup) {
    if (item.stars == undefined) return '';
    return item.stars.replace(' stars', '');
  }
}
