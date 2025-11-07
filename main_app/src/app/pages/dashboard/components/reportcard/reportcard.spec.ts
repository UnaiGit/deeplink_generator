import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reportcard } from './reportcard';

describe('Reportcard', () => {
  let component: Reportcard;
  let fixture: ComponentFixture<Reportcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reportcard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reportcard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
