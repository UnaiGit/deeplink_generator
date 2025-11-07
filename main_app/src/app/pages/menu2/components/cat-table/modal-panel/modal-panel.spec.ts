import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPanel } from './modal-panel';

describe('ModalPanel', () => {
  let component: ModalPanel;
  let fixture: ComponentFixture<ModalPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
