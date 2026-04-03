import { describe, expect, it } from 'vitest';

import {
  applyPincodeLookup,
  buildRepresentativePincodeMap,
  getLocationLookupFilters,
  hasRowsMissingPincodes,
} from '../lib/upload-location-lookup';

describe('upload location lookup helpers', () => {
  it('detects when rows need pincode enrichment', () => {
    expect(
      hasRowsMissingPincodes([
        {
          origin_city: 'Mumbai',
          origin_state: 'Maharashtra',
          destination_city: 'Pune',
          destination_state: 'Maharashtra',
        },
      ]),
    ).toBe(true);

    expect(
      hasRowsMissingPincodes([
        {
          origin_pincode: '400001',
          destination_pincode: '411001',
          origin_city: 'Mumbai',
          origin_state: 'Maharashtra',
          destination_city: 'Pune',
          destination_state: 'Maharashtra',
        },
      ]),
    ).toBe(false);
  });

  it('builds lookup filters with normalized title-case variants', () => {
    expect(
      getLocationLookupFilters([
        {
          origin_city: 'mumbai',
          origin_state: 'maharashtra',
          destination_city: 'PUNE',
          destination_state: 'MAHARASHTRA',
        },
      ]),
    ).toEqual({
      cities: ['mumbai', 'Mumbai', 'PUNE', 'Pune'],
      states: ['maharashtra', 'Maharashtra', 'MAHARASHTRA'],
    });
  });

  it('fills missing origin and destination pincodes without overwriting existing ones', () => {
    const lookup = buildRepresentativePincodeMap([
      { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    ]);

    expect(
      applyPincodeLookup(
        [
          {
            origin_city: 'Mumbai',
            origin_state: 'Maharashtra',
            destination_city: 'Pune',
            destination_state: 'Maharashtra',
          },
          {
            origin_city: 'Mumbai',
            origin_state: 'Maharashtra',
            origin_pincode: '499999',
            destination_city: 'Pune',
            destination_state: 'Maharashtra',
            customer_pincode: '411999',
          },
        ],
        lookup,
      ),
    ).toEqual([
      {
        origin_city: 'Mumbai',
        origin_state: 'Maharashtra',
        destination_city: 'Pune',
        destination_state: 'Maharashtra',
        origin_pincode: '400001',
        destination_pincode: '411001',
      },
      {
        origin_city: 'Mumbai',
        origin_state: 'Maharashtra',
        origin_pincode: '499999',
        destination_city: 'Pune',
        destination_state: 'Maharashtra',
        customer_pincode: '411999',
      },
    ]);
  });
});