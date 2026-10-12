import { omit } from 'lodash-es';

import {
  companySizeBandOf,
  declinesSponsorship,
  factLinesOf,
  parseCard,
  parseCards,
  parseCompensation,
} from '~/scripts/job-search/discovery/cards';
import { detailCandidate } from '~/scripts/job-search/discovery/detail-candidates';
import { matchPageCards } from '~/scripts/job-search/discovery/pool';

import { candidate } from './fixtures';

const Now = new Date('2026-10-04T12:00:00.000Z');

describe('parseCard()', () => {
  it('reads every fact a card publishes', () => {
    expect(
      parseCard(
        {
          id: '4012345678',
          lines: [
            'Senior Software Engineer',
            'Senior Software Engineer with verification',
            'Hooli',
            'San Francisco, CA (Hybrid)',
            '$150K/yr - $180K/yr',
            'Posted 3 days ago',
            'Easy Apply',
          ],
          title: 'Senior Software Engineer',
        },
        Now,
      ),
    ).toStrictEqual({
      applyUrl: null,
      applyVia: 'easy-apply',
      company: 'Hooli',
      companySize: null,
      compensation: { currency: 'USD', maximum: 180000, minimum: 150000 },
      id: '4012345678',
      location: 'San Francisco, CA',
      postedAt: '2026-10-01T12:00:00.000Z',
      sponsorshipOffered: null,
      title: 'Senior Software Engineer',
      workplace: 'hybrid',
    });
  });

  it('takes the company from the line after the last repeat of the title', () => {
    expect(
      parseCard(
        {
          id: null,
          lines: [
            'Staff Software Engineer',
            'Staff Software Engineer',
            'Staff Software Engineer (Verified job)',
            'Hooli',
            'United States (Remote)',
          ],
          title: 'Staff Software Engineer',
        },
        Now,
      ),
    ).toMatchObject({ company: 'Hooli', location: 'United States', workplace: 'remote' });
  });

  it('takes the first line as the company when the title is not repeated', () => {
    expect(
      parseCard({ id: null, lines: ['Hooli', 'Remote'], title: 'Staff Software Engineer' }, Now),
    ).toMatchObject({ applyVia: 'unresolved', company: 'Hooli', workplace: null });
  });

  it('leaves unpublished facts null', () => {
    expect(
      parseCard({ id: null, lines: ['Hooli', 'Posted just now'], title: 'Engineer' }, Now),
    ).toMatchObject({ compensation: null, location: null, postedAt: null, workplace: null });
  });

  it('reads nothing for a card whose text is only the title', () => {
    expect(
      parseCard({ id: null, lines: ['Engineer', 'Engineer'], title: 'Engineer' }, Now),
    ).toBeNull();
  });
});

describe('parseCards()', () => {
  it('sets aside the cards that name no company', () => {
    const { facts, unreadable } = parseCards(
      [
        { id: null, lines: ['Engineer'], title: 'Engineer' },
        { id: null, lines: ['Engineer', 'Hooli'], title: 'Engineer' },
      ],
      Now,
    );
    expect(facts.map(({ company }) => company)).toStrictEqual(['Hooli']);
    expect(unreadable).toStrictEqual(['Engineer']);
  });
});

describe('parseCompensation()', () => {
  it.each([
    ['$150K/yr - $180K/yr', { currency: 'USD', maximum: 180000, minimum: 150000 }],
    ['$150,000/yr - $180,000/yr', { currency: 'USD', maximum: 180000, minimum: 150000 }],
    ['$1.5M/yr', { currency: 'USD', maximum: null, minimum: 1500000 }],
    ['$70/hr - $90/hr', null],
    ['Competitive salary', null],
  ])('reads %s', (line, expected) => {
    expect(parseCompensation(line)).toStrictEqual(expected);
  });
});

describe('posting facts', () => {
  it.each([
    [['51-200 employees'], '51-200'],
    [['10,001+ employees'], '10001+'],
    [['1,001-5,000 employees', '3,000 on LinkedIn'], '1001-5000'],
    [['About the company'], null],
  ])('reads the company size from %j', (lines, expected) => {
    expect(companySizeBandOf(lines)).toBe(expected);
  });

  it.each([
    ['We are unable to offer visa sponsorship.', true],
    ['No sponsorship is available for this role.', true],
    ['Visa sponsorship is not available', true],
    ['Sponsorship is not available.', true],
    ['Visa sponsorship is available.', false],
    ['We do not require a degree.', false],
  ])('reads sponsorship from "%s"', (line, expected) => {
    expect(declinesSponsorship([line])).toBe(expected);
  });

  it('keeps the lines that state facts, limited in number', () => {
    const text = ['Intro', ...Array.from({ length: 30 }, () => 'Hybrid, two office days')].join(
      '\n',
    );
    expect(factLinesOf(text)).toHaveLength(20);
  });
});

describe('detailCandidate()', () => {
  const detail = {
    applyUrl: null,
    closed: false,
    easyApply: true,
    id: '4012345678',
    text: [
      'Senior Software Engineer',
      '$160K/yr - $190K/yr',
      'No sponsorship is available.',
      '51-200 employees',
    ].join('\n'),
    url: 'https://www.linkedin.com/jobs/view/4012345678/',
  };

  it('adds the facts the posting states to the pooled candidate', () => {
    expect(
      detailCandidate(
        candidate({
          companySize: null,
          compensation: null,
          id: null,
          sponsorshipOffered: null,
        }),
        detail,
        '4012345678',
      ),
    ).toMatchObject({
      applyVia: 'easy-apply',
      companySize: '51-200',
      compensation: { currency: 'USD', maximum: 190000, minimum: 160000 },
      id: '4012345678',
      sponsorshipOffered: false,
    });
  });

  it('keeps what the card published when the posting states nothing', () => {
    expect(
      detailCandidate(
        candidate({ sponsorshipOffered: null }),
        { ...detail, text: 'Hello' },
        '4012345678',
      ),
    ).toMatchObject({
      companySize: '51-200',
      compensation: { maximum: 200000, minimum: 170000 },
      sponsorshipOffered: null,
    });
  });

  it('identifies the application system from the external apply link', () => {
    expect(
      detailCandidate(
        candidate(),
        { ...detail, applyUrl: 'https://boards.greenhouse.io/hooli/jobs/1', easyApply: false },
        '4012345678',
      ),
    ).toMatchObject({
      applyUrl: 'https://boards.greenhouse.io/hooli/jobs/1',
      applyVia: 'greenhouse',
    });
  });

  it('leaves the system unresolved when the page shows no way to apply', () => {
    expect(
      detailCandidate(candidate(), { ...detail, easyApply: false }, '4012345678'),
    ).toMatchObject({ applyVia: 'unresolved' });
  });
});

describe('matchPageCards()', () => {
  const card = (company: string, title: string) =>
    omit(candidate({ company, id: null, title }), 'source');

  it('keeps the pool ranking and drops the pooled candidates the page lacks', () => {
    const ranked = [
      candidate({ company: 'Hooli', title: 'Engineer' }),
      candidate({ company: 'Pied Piper', title: 'Engineer' }),
      candidate({ company: 'Initech', title: 'Engineer' }),
    ];
    const matches = matchPageCards(
      ranked,
      [card('Initech', 'Engineer'), card('hooli, inc.', 'Engineer')],
      10,
    );
    expect(matches.map(({ pooled }) => pooled.company)).toStrictEqual(['Hooli', 'Initech']);
  });

  it('stops at the limit', () => {
    const ranked = [candidate({ company: 'Hooli' }), candidate({ company: 'Initech' })];
    const cards = ranked.map(({ company, title }) => card(company, title));
    expect(matchPageCards(ranked, cards, 1)).toHaveLength(1);
  });
});
