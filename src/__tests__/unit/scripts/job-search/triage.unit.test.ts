import { PreferencesSchema } from '~/scripts/job-search/schemas';
import { triageCandidates, type TriageInput } from '~/scripts/job-search/triage/triage';

import { candidate, MinimalPreferences, posting } from './fixtures';

const Input: TriageInput = {
  candidates: [],
  now: new Date('2026-10-03T12:00:00.000Z'),
  preferences: PreferencesSchema.parse(MinimalPreferences),
  recorded: [],
  runId: '2026-10-03-1',
  stage: 'card',
};

const Survivor = candidate({ company: 'Hooli', id: '4000000001' });

const Rejected = candidate({ company: 'Initech', id: '4000000002' });

describe('triageCandidates()', () => {
  it('records rejections but not survivors at the card stage', () => {
    const result = triageCandidates({ ...Input, candidates: [Survivor, Rejected] });
    expect(result.survivors).toStrictEqual([Survivor]);
    expect(result.rejected).toStrictEqual([
      { id: '4000000002', reason: "The company 'Initech' is the current employer." },
    ]);
    expect(result.records.map(({ id, status }) => ({ id, status }))).toStrictEqual([
      { id: '4000000002', status: 'filtered' },
    ]);
  });

  it('records survivors as pending their score at the detail stage', () => {
    const { records } = triageCandidates({ ...Input, candidates: [Survivor], stage: 'detail' });
    expect(records).toStrictEqual([
      posting({
        company: 'Hooli',
        fingerprint: 'hooli|senior-software-engineer',
        firstSeenAt: '2026-10-03T12:00:00.000Z',
        id: '4000000001',
        source: { kind: 'search', run: '2026-10-03-1', search: 'senior-frontend-remote' },
        status: 'pending',
        title: 'Senior Software Engineer',
        url: 'https://www.linkedin.com/jobs/view/4012345678',
      }),
    ]);
  });

  it('skips a candidate already in the ledger under the same job identifier', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [Survivor],
      recorded: [posting({ id: '4000000001' })],
    });
    expect(result.duplicates).toStrictEqual([{ duplicateOf: '4000000001', id: '4000000001' }]);
    expect(result.survivors).toStrictEqual([]);
    expect(result.records).toStrictEqual([]);
  });

  it('skips a repost of a recorded posting under a new job identifier', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [Survivor],
      recorded: [posting({ fingerprint: 'hooli|senior-software-engineer', id: '3999999999' })],
    });
    expect(result.duplicates).toStrictEqual([{ duplicateOf: '3999999999', id: '4000000001' }]);
  });

  it('skips a candidate repeated earlier in the same batch', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [Survivor, candidate({ company: 'Hooli, Inc.', id: '4000000003' })],
    });
    expect(result.survivors).toStrictEqual([Survivor]);
    expect(result.duplicates).toStrictEqual([{ duplicateOf: '4000000001', id: '4000000003' }]);
  });
});
