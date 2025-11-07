import { TestBed } from '@angular/core/testing';

import { I18nServices } from './i18n.services';

describe('I18nServices', () => {
  let service: I18nServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
