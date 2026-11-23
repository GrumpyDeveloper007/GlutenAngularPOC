import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  context: string | undefined;
  @Input() set selectedContext(value: string | undefined) {
    if (value?.startsWith('United States'))
      this.context = 'United States';
    else
      this.context = value;
  }
}
