import {
  classifyApplyUrl,
  resolveApplyDestination,
} from '~/scripts/job-search/discovery/apply-systems';

const wrapped = (destination: string): string =>
  `https://www.linkedin.com/safety/go/?url=${encodeURIComponent(destination)}&urlhash=abcd`;

describe('classifyApplyUrl()', () => {
  it.each([
    ['https://boards.greenhouse.io/hooli/jobs/123', 'greenhouse'],
    ['https://job-boards.greenhouse.io/hooli/jobs/123', 'greenhouse'],
    ['https://hooli.com/careers/openings?gh_jid=123', 'greenhouse'],
    ['https://jobs.lever.co/hooli/1a2b', 'lever'],
    ['https://jobs.ashbyhq.com/hooli/1a2b', 'ashby'],
    ['https://hooli.wd5.myworkdayjobs.com/en-US/careers/job/123', 'workday'],
    ['https://ats.rippling.com/hooli/jobs/1a2b', 'other'],
    ['not a url', 'other'],
  ])('classifies %s as %s', (url, system) => {
    expect(classifyApplyUrl(url)).toBe(system);
  });

  it("classifies a link through LinkedIn's outbound interstitial by its destination", () => {
    expect(classifyApplyUrl(wrapped('https://jobs.lever.co/hooli/1a2b'))).toBe('lever');
  });

  it('does not mistake a host that merely ends in a system name for the system', () => {
    expect(classifyApplyUrl('https://notlever.co/jobs/1')).toBe('other');
  });
});

describe('resolveApplyDestination()', () => {
  it("unwraps LinkedIn's outbound interstitial", () => {
    expect(resolveApplyDestination(wrapped('https://jobs.ashbyhq.com/hooli/1a2b'))?.href).toBe(
      'https://jobs.ashbyhq.com/hooli/1a2b',
    );
  });
});
