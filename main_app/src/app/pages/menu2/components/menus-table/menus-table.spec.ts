import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusTable } from './menus-table';

describe('MenusTable', () => {
  let component: MenusTable;
  let fixture: ComponentFixture<MenusTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
