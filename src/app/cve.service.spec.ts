import { TestBed } from '@angular/core/testing';

import { CveService } from './cve.service';

describe('CveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CveService = TestBed.get(CveService);
    expect(service).toBeTruthy();
  });
});
