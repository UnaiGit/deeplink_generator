import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusLegend } from './status-legend';

describe('StatusLegend', () => {
  let component: StatusLegend;
  let fixture: ComponentFixture<StatusLegend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusLegend]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusLegend);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
