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
      {
        company: 'Initech',
        id: '4000000002',
        reason: "The company 'Initech' is the current employer.",
        title: 'Senior Software Engineer',
      },
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
        url: 'https://www.linkedin.com/jobs/view/4000000001/',
      }),
    ]);
  });

  it('identifies the applicant tracking system of an external posting from its apply link', () => {
    const { records } = triageCandidates({
      ...Input,
      candidates: [
        candidate({
          applyUrl: 'https://jobs.ashbyhq.com/hooli/1a2b3c',
          applyVia: 'unresolved',
          company: 'Hooli',
          id: '4000000001',
        }),
      ],
      stage: 'detail',
    });
    expect(records.map(({ applyVia }) => applyVia)).toStrictEqual(['ashby']);
  });

  it('filters result cards that carry no job identifier, recording none of them', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [
        candidate({ company: 'Hooli', id: null }),
        candidate({ company: 'Initech', id: null }),
      ],
    });
    expect(result.survivors.map(({ company }) => company)).toStrictEqual(['Hooli']);
    expect(result.rejected.map(({ company, id }) => ({ company, id }))).toStrictEqual([
      { company: 'Initech', id: null },
    ]);
    expect(result.records).toStrictEqual([]);
  });

  it('refuses a candidate without a job identifier at the detail stage', () => {
    expect(() =>
      triageCandidates({ ...Input, candidates: [candidate({ id: null })], stage: 'detail' }),
    ).toThrow('must carry the job identifier');
  });

  it('skips a candidate already in the ledger under the same job identifier', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [Survivor],
      recorded: [posting({ id: '4000000001' })],
    });
    expect(result.duplicates).toStrictEqual([
      {
        company: 'Hooli',
        duplicateOf: '4000000001',
        id: '4000000001',
        title: 'Senior Software Engineer',
      },
    ]);
    expect(result.survivors).toStrictEqual([]);
    expect(result.records).toStrictEqual([]);
  });

  it('skips a result card matching a recorded posting by fingerprint alone', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [candidate({ company: 'Hooli, Inc.', id: null })],
      recorded: [posting({ fingerprint: 'hooli|senior-software-engineer', id: '3999999999' })],
    });
    expect(result.duplicates.map(({ duplicateOf }) => duplicateOf)).toStrictEqual(['3999999999']);
  });

  it('skips a candidate repeated earlier in the same batch', () => {
    const result = triageCandidates({
      ...Input,
      candidates: [Survivor, candidate({ company: 'Hooli, Inc.', id: '4000000003' })],
    });
    expect(result.survivors).toStrictEqual([Survivor]);
    expect(result.duplicates.map(({ duplicateOf, id }) => ({ duplicateOf, id }))).toStrictEqual([
      { duplicateOf: '4000000001', id: '4000000003' },
    ]);
  });
});
