import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, Marker } from 'maplibre-gl';
import * as maplibre from 'maplibre-gl';
import myData from './Topics.json';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map | undefined;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    const initialState = { lng: 139.753, lat: 35.6844, zoom: 14 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=notmykey`,
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
            var popup = new maplibre.Popup({ offset: 25 })
              .setHTML(`<a href="${element.FacebookUrl}" target="_blank">Facebook</a> <h3>${title}</h3>                    `);


            console.debug("lat :" + url.Pin.GeoLatatude + " long :" + url.Pin.GeoLongitude)
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