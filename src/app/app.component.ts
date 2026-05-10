import { Component, inject, Input, Renderer2 } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./navbar/navbar.component";
import { Title, Meta } from '@angular/platform-browser';
import { SiteApiService, GlutenApiService, GroupService } from './_services';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'FB Gluten free Map';
  description = "Provides the indexing of gluten free FB group posts. A helpful site for coeliacs and people looking for gluten free places to eat/restaurants or hotels.";
  context: string | undefined;
  isCityRoute: boolean = false;
  private renderer = inject(Renderer2)

  constructor(private titleService: Title,
    private metaService: Meta,
    private apiService: GlutenApiService,
    public groupService: GroupService,
    private siteApiService: SiteApiService,
    private router: Router
  ) {
    // Check if current route is a city route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      let isCityRoute = event.url.startsWith('/city/');
      if (isCityRoute) {
        const pathParts = event.url.split('/');
        let context = pathParts[pathParts.length - 1];
        context = context.replaceAll('%20', ' ');
        this.title = 'FB Gluten free Map - ' + context;
        this.context = context;
      }
    });
  }

  ngOnInit() {
    this.siteApiService.loadCountryMeta().subscribe(data => {
      let country = this.siteApiService.getUrlCountry();
      let description = this.description;
      if (country != undefined) {
        console.log('country set', country);
        this.context = country;
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

    const path = window.location.pathname;
    const pathParts = path.split('/');
    //console.log("path", path.split('/'));
    if (pathParts.length == 3 && pathParts[1] == 'places') {
      // places/
      this.metaService.addTag({ name: 'robots', content: 'noindex' });
    }

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
