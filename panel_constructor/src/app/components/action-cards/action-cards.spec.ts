import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCards } from './action-cards';

describe('ActionCards', () => {
  let component: ActionCards;
  let fixture: ComponentFixture<ActionCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

