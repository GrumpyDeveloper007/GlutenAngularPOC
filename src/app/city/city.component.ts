import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopicGroup, CityDTO } from '../_model/model';
import { GlutenApiService } from '../_services';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent implements OnInit {
  cityName: string = '';
  restaurants: TopicGroup[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: GlutenApiService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.cityName = params.get('cityName') || '';
      //console.log('City name:', this.cityName);
      this.loadRestaurants();
    });

  }

  loadRestaurants() {
    if (!this.cityName) {
      return;
    }

    this.isLoading = true;

    // Call API to get city data
    this.apiService.getCity(this.cityName).subscribe({
      next: (cityData: CityDTO) => {
        this.isLoading = false;
        if (cityData && cityData.topics && cityData.topics.length > 0) {
          // Get top 10 restaurants from API response
          this.restaurants = cityData.topics;
        } else {
        }
      },
      error: (error) => {
        console.error('Error loading city data:', error);
        this.isLoading = false;
      }
    });
  }

  buildFbUrl(item: any): string {
    if (item.gId == 'TEST') {
      return '';
    }
    return `https://www.facebook.com/groups/${item.gId}/permalink/${item.lId}`;
  }

  dateOnly(date: Date) {
    let currentDate = new Date(date);
    return currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }
}
