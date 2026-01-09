import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  country: string | undefined;
  @Input() set selectedCountry(value: string | undefined) {
    if (value?.startsWith('United States')) this.country = 'United States';
    else
      this.country = value;
  }
}
