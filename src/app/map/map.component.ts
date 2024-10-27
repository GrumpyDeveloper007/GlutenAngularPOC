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

  buttonClick2(element: any): void {
    console.debug("click");
    console.debug(element);
    this.selectedTopic = element as Topic;
    this.selectedTopicChange.emit(this.selectedTopic);
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

    var pinTopics: any[] = [];
    // gather pins 
    myData.forEach(element => {

      if (element.AiVenues != null) {
        element.AiVenues.forEach(venue => {
          if (venue.Pin != null) {
            (element as Topic).Header = venue.Pin.Label;
            var pinTopic = {
              GeoLongitude: parseFloat(venue.Pin.GeoLongitude),
              GeoLatatude: parseFloat(venue.Pin.GeoLatatude),
              Label: venue.Pin.Label,
              Topics: [element]
            };

            var found = false;
            pinTopics.forEach(item => {
              if (item.GeoLongitude == pinTopic.GeoLongitude
                && item.GeoLatatude == pinTopic.GeoLatatude
              ) {
                item.Topics.push(element);
                found = true;
              }
            });

            if (!found) {
              pinTopics.push(pinTopic);
            }
          }
        });
      }


      if (element.UrlsV2 != null) {
        element.UrlsV2.forEach(url => {
          if (url.Pin != null) {
            if (url.Pin.Label != null) {
              (element as Topic).Header = url.Pin.Label;
            }
            var pinTopic = {
              GeoLongitude: parseFloat(url.Pin.GeoLongitude),
              GeoLatatude: parseFloat(url.Pin.GeoLatatude),
              Label: url.Pin.Label,
              Topics: [element]
            }

            var found = false;
            pinTopics.forEach(item => {
              if (item.GeoLongitude == pinTopic.GeoLongitude
                && item.GeoLatatude == pinTopic.GeoLatatude
              ) {
                var foundElement = false;
                pinTopics.forEach(elementItem => {
                  if (elementItem.NodeID == element.NodeID) {
                    foundElement = true;
                  }
                });
                if (!foundElement) {
                  console.debug("updating url pin");
                  item.Topics.push(element);
                }
                found = true;
              }
            });

            if (!found) {
              console.debug("adding url pin");
              pinTopics.push(pinTopic);
            }
          }
        });
      }

    });

    var map = this.map;

    console.debug("Total pins :" + pinTopics.length);
    pinTopics.forEach(pin => {

      var topicFbLinks = "";
      var firstTopic: any = pin.Topics[0];
      pin.Topics.forEach((element: Topic) => {
        topicFbLinks += `<a href="${element.FacebookUrl}" target="_blank">Facebook</a><br></br>`;
      });

      var eventName = pin.Topics[0].NodeID.replaceAll('=', "");

      // trigger event to call a function back in angular
      var popup = new maplibre.Popup({ offset: 25 })
        .setHTML(`<h3>${pin.Label}</h3><div>${topicFbLinks}</div>`)
        .on('open', () => {
          //this.buttonClick(eventName);
          this.buttonClick2(firstTopic);
        });


      new Marker({ color: "#FF0000" })
        .setLngLat([parseFloat(pin.GeoLongitude), parseFloat(pin.GeoLatatude)])
        .setPopup(popup)
        .addTo(map);


    });


    /*
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
    });*/
  }

  ngOnDestroy() {
    this.map?.remove();
  }

}