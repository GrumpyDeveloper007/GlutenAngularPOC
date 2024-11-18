import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myData from './TopicsExport.json';
import { Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Topic, TopicGroup } from "../model/model";
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() selectedTopicChange = new EventEmitter<Topic>();
  @Output() selectedTopicGroupChange = new EventEmitter<TopicGroup>();
  map: Map | undefined;
  facebookLink: SafeResourceUrl = 'about:blank';
  selectedTopic: Topic | null = null;
  selectedTopicGroup: TopicGroup | null = null;


  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private renderer: Renderer2, public sanitizer: DomSanitizer) { }

  pinSelected(pin: any, element: any): void {
    this.selectedTopic = element as Topic;
    this.selectedTopicChange.emit(this.selectedTopic);
    this.selectedTopicGroup = pin as TopicGroup;
    this.selectedTopicGroupChange.emit(this.selectedTopicGroup);
    console.debug("pin click");
    return;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const initialState = { lng: 139.753, lat: 35.6844, zoom: 14 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=1nY38lyeIv8XEbtohY5t`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      interactive: true,
    });
    this.map.addControl(new maplibre.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    this.map.addControl(new NavigationControl({}), 'top-right');

    var pinTopics: any[] = myData;
    var map = this.map;

    console.debug("Total pins :" + pinTopics.length);
    pinTopics.forEach(pin => {

      var topicFbLinks = "";
      var firstTopic: any = pin.Topics[0];
      pin.Topics.forEach((element: Topic) => {
        topicFbLinks += `<a href="${element.FacebookUrl}" target="_blank">Facebook</a><br></br>`;
      });

      // trigger event to call a function back in angular
      var popup = new maplibre.Popup({ offset: 25 })
        .setHTML(`<h3>${pin.Label}</h3><div>${topicFbLinks}</div>`)
        .on('open', () => {
          this.pinSelected(pin, firstTopic);
        });

      new Marker({ color: "#FF0000" })
        .setLngLat([parseFloat(pin.GeoLongitude), parseFloat(pin.GeoLatatude)])
        .setPopup(popup)
        .addTo(map);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

}