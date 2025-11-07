import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mapcard } from './mapcard';

describe('Mapcard', () => {
  let component: Mapcard;
  let fixture: ComponentFixture<Mapcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mapcard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mapcard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
