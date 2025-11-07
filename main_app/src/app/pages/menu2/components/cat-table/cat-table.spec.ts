import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatTable } from './cat-table';

describe('CatTable', () => {
  let component: CatTable;
  let fixture: ComponentFixture<CatTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
