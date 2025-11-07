import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorTabs } from './floor-tabs';

describe('FloorTabs', () => {
  let component: FloorTabs;
  let fixture: ComponentFixture<FloorTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
