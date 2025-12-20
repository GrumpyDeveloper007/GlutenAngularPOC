import { Component, inject, Input, Renderer2, RendererFactory2, ViewChild } from '@angular/core';
import { NavbarComponent } from "./navbar/navbar.component";
import { MapLeafletComponent } from "./map.leaflet/map.component";
import { MapfiltersComponent } from "./mapfilters/mapfilters.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopicGroup, CountryMeta } from "./_model/model";
import { Restaurant } from "./_model/restaurant";
import { FilterOptions } from "./_model/filterOptions";
import { Title, Meta } from '@angular/platform-browser';
import { SiteApiService } from './_services';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapLeafletComponent, NavbarComponent, SidebarComponent, MapfiltersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'FB Gluten free Map';
  description = "Provides the indexing of gluten free FB group posts. A helpful site for coeliacs and people looking for gluten free places to eat/restaurants or hotels.";
  selectedTopicGroup: TopicGroup | null = null;
  showOptions: FilterOptions = new FilterOptions(true, true, true, false, false, true, false, "English", "");
  restaurants: Restaurant[] = [];
  country: string | undefined;
  private renderer = inject(Renderer2)
  @ViewChild(MapLeafletComponent, { static: false }) child!: MapLeafletComponent;
  @Input('id') productId = '';


  constructor(private titleService: Title,
    private metaService: Meta,
    private siteApiService: SiteApiService
  ) { }

  showListView() {
    this.child.loadDetailsForAllPinsInCountry();
  }

  showGroupsView() {
    this.child.loadMapPins();
  }

  countryChanged(country: string) {
    this.country = country;
  }

  ngOnInit() {
    this.siteApiService.loadCountryMeta().subscribe(data => {
      let country = this.siteApiService.getUrlCountry();
      let description = this.description;
      if (country != undefined) {
        console.log('country set', country);
        this.country = country;
        this.siteApiService.setSelectedCountry(country);
        let selectedCountryMeta = this.siteApiService.getCountryMeta();
        let title = `${this.title} - ${country}`;
        let gf = selectedCountryMeta?.GlutenFree;
        let coeliac = selectedCountryMeta?.Coeliac;
        if (!gf) gf = 'Gluten Free';
        if (!coeliac) coeliac = 'Coeliac';//Coliac?
        description = `A map of ${gf} (${coeliac} friendly) restaurants/hotels in ${country}`;
        this.setSEOData(title, description, gf, coeliac);
        this.addStructuredData(title, description);
      }
      else {
        this.setSEOData(this.title, description, 'Gluten Free', 'Coeliac')
        this.addStructuredData(this.title, description);
      }
    });
  }

  setSEOData(title: string, description: string, gf: string, coeliac: string) {
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: `${gf}, ${coeliac}, ${gf} Restaurant, ${gf} Map, ${gf} near me, ${gf} restaurants near me, ${gf} food near me` });

    // Open Graph Meta Tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
  }

  addStructuredData(title: string, description: string) {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';

    script.text = JSON.stringify({
      "@context": "http://schema.org",
      "@type": "Organization",
      name: title,
      url: "https://www.dalesgfmap.com/",
      logo: "https://www.dalesgfmap.com/favicon.ico",
      description: description
    });
    this.renderer.appendChild(document.head, script);
  }
}
