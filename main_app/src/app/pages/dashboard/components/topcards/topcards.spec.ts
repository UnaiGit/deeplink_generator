import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Topcards } from './topcards';

describe('Topcards', () => {
  let component: Topcards;
  let fixture: ComponentFixture<Topcards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topcards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Topcards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
