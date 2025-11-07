import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrasTable } from './extras-table';

describe('ExtrasTable', () => {
  let component: ExtrasTable;
  let fixture: ComponentFixture<ExtrasTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtrasTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtrasTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
