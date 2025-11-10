import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pastry } from './pastry';

describe('Pastry', () => {
  let component: Pastry;
  let fixture: ComponentFixture<Pastry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pastry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pastry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
