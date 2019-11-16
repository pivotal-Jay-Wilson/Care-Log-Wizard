import { TestBed } from '@angular/core/testing';

import { ReadingroomService } from './readingroom.service';

describe('ReadingroomService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReadingroomService = TestBed.get(ReadingroomService);
    expect(service).toBeTruthy();
  });
});
