import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gensales } from './gensales';

describe('Gensales', () => {
  let component: Gensales;
  let fixture: ComponentFixture<Gensales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gensales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gensales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
