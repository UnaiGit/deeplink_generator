import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartTable } from './depart-table';

describe('DepartTable', () => {
  let component: DepartTable;
  let fixture: ComponentFixture<DepartTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
