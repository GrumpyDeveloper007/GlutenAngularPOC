import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapfiltersComponent } from './mapfilters.component';

describe('MapfiltersComponent', () => {
  let component: MapfiltersComponent;
  let fixture: ComponentFixture<MapfiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapfiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapfiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
