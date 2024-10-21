import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myData from './Topics.json';
import { Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Topic } from "../model/model";
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() selectedTopicChange = new EventEmitter<Topic>();
  map: Map | undefined;
  facebookLink: SafeResourceUrl = 'about:blank';
  selectedTopic: Topic | null = null;


  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private renderer: Renderer2, public sanitizer: DomSanitizer) { }


  buttonClick(elementNodeID: string): void {
    console.debug(elementNodeID);
    myData.forEach(element => {
      element.UrlsV2.forEach(url => {
        if (url.Pin != null) {
          var eventName = element.NodeID.replaceAll('=', "");
          if (eventName == elementNodeID) {
            this.selectedTopic = element as Topic;
            this.selectedTopicChange.emit(this.selectedTopic);
            return;
          }
        }
      });
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const initialState = { lng: 139.753, lat: 35.6844, zoom: 14 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=1nY38lyeIv8XEbtohY5t`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });
    this.map.addControl(new NavigationControl({}), 'top-right');

    var map = this.map;
    myData.forEach(element => {
      if (element.UrlsV2 != null) {
        var title = element.Title;
        var title = title.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

        element.HashTags.forEach(tag => {
          title = title.replaceAll(tag, "")
        });

        element.UrlsV2.forEach(url => {
          if (url.Pin != null) {

            var eventName = element.NodeID.replaceAll('=', "");
            window.addEventListener(eventName, () => {
              this.buttonClick(eventName);
            });

            // trigger event to call a function back in angular
            const htmlString = `<button onclick="window.dispatchEvent(new CustomEvent('${eventName}'))">Click Me</button>`
            var popup = new maplibre.Popup({ offset: 25 })
              .setHTML(htmlString + `<div #${element.NodeID}><a href="${element.FacebookUrl}" target="_blank">Facebook</a></div> <h3>${url.Pin.Label}</h3>   `);

            new Marker({ color: "#FF0000" })
              .setLngLat([parseFloat(url.Pin.GeoLongitude), parseFloat(url.Pin.GeoLatatude)])
              .setPopup(popup)
              .addTo(map);
          }
        })
      }
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }

}