import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orderpannel } from './orderpannel';

describe('Orderpannel', () => {
  let component: Orderpannel;
  let fixture: ComponentFixture<Orderpannel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orderpannel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Orderpannel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
