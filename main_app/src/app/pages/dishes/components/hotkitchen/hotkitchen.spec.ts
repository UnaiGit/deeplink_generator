import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hotkitchen } from './hotkitchen';

describe('Hotkitchen', () => {
  let component: Hotkitchen;
  let fixture: ComponentFixture<Hotkitchen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hotkitchen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hotkitchen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
