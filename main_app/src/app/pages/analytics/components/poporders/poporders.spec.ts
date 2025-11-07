import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Poporders } from './poporders';

describe('Poporders', () => {
  let component: Poporders;
  let fixture: ComponentFixture<Poporders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Poporders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Poporders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
