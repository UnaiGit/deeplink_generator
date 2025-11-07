import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishesTable } from './dishes-table';

describe('DishesTable', () => {
  let component: DishesTable;
  let fixture: ComponentFixture<DishesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishesTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishesTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
