import { Component, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { MapLeafletComponent } from "./map.leaflet/map.component";
import { MapfiltersComponent } from "./mapfilters/mapfilters.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopicGroup } from "./_model/model";
import { Restaurant } from "./_model/restaurant";
import { FilterOptions } from "./_model/filterOptions";
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapLeafletComponent, NavbarComponent, SidebarComponent, MapfiltersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gluten-angular-map';
  description = "Provides the indexing of gluten free FB group posts. A helpful site for coeliacs and people looking for gluten free places to eat or stay.";
  selectedTopicGroup: TopicGroup | null = null;
  showOptions: FilterOptions = new FilterOptions(true, true, true, true, false, true);
  restaurants: Restaurant[] = [];
  private renderer = inject(Renderer2)
  private rendererFactory = inject(RendererFactory2)

  constructor(private titleService: Title, private metaService: Meta) { }

  setSEOData(title: string, description: string) {
    //https://gist.github.com/whitingx/3840905
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    this.metaService.addTag({ name: 'keywords', content: 'Gluten, Coeliac, Restaurant, Map' });

    // Open Graph Meta Tags
    this.metaService.addTag({ property: 'og:title', content: title });
    this.metaService.addTag({ property: 'og:description', content: description });
    //this.metaService.addTag({ property: 'og:image', content: 'path/to/your/image.png' });
  }

  ngOnInit() {
    this.setSEOData(this.title, this.description)
    this.addStructuredData();
  }

  addStructuredData() {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = `
    {
      "@context": "http://schema.org",
      "@type": "Organization",
      "name": this.title,
      "url": "https://www.dalesgfmap.com/",
      "logo": "https://www.dalesgfmap.com/favicon.ico",
      "description": this.description
    }`;
    this.renderer.appendChild(document.head, script);
  }
}
