import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablelist } from './tablelist';

describe('Tablelist', () => {
  let component: Tablelist;
  let fixture: ComponentFixture<Tablelist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablelist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tablelist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
