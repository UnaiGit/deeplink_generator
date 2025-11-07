import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menu2 } from './menu2';

describe('Menu2', () => {
  let component: Menu2;
  let fixture: ComponentFixture<Menu2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menu2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
