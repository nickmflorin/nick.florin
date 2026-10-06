import {
  findDuplicate,
  normalizeCompanyName,
  postingFingerprint,
} from '~/scripts/job-search/ledger/fingerprint';

import { posting } from './fixtures';

describe('normalizeCompanyName()', () => {
  it.each([
    ['Acme, Inc.', 'acme'],
    ['ACME', 'acme'],
    ['Acme Corp', 'acme'],
    ['Globex Co. Ltd.', 'globex'],
    ['Café Nova LLC', 'cafe-nova'],
    ['Inc', 'inc'],
  ])('normalizes %s to %s', (name, normalized) => {
    expect(normalizeCompanyName(name)).toBe(normalized);
  });
});

describe('postingFingerprint()', () => {
  it('joins the normalized company name and title', () => {
    expect(
      postingFingerprint({ company: 'Acme, Inc.', title: 'Senior Frontend Engineer (Remote)' }),
    ).toBe('acme|senior-frontend-engineer-remote');
  });
});

describe('findDuplicate()', () => {
  const recorded = [
    posting({ fingerprint: 'acme|senior-frontend-engineer', id: '4012345678' }),
    posting({ fingerprint: 'globex|staff-engineer', id: '4012345679' }),
  ];

  it('finds the posting with the same job identifier', () => {
    expect(
      findDuplicate(recorded, { fingerprint: 'initech|platform-engineer', id: '4012345679' }),
    ).toStrictEqual(recorded[1]);
  });

  it('finds a repost under a new job identifier by its fingerprint', () => {
    expect(
      findDuplicate(recorded, { fingerprint: 'acme|senior-frontend-engineer', id: '4099999999' }),
    ).toStrictEqual(recorded[0]);
  });

  it('returns null for a posting not seen before', () => {
    expect(
      findDuplicate(recorded, { fingerprint: 'initech|platform-engineer', id: '4099999999' }),
    ).toBeNull();
  });
});
