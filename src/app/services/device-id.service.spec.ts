import { TestBed } from '@angular/core/testing';

import { DeviceIDService } from './device-id.service';

describe('DeviceIDService', () => {
  let service: DeviceIDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceIDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
