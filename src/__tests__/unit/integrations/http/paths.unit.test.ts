import { withoutLeadingSlashes, withoutTrailingSlashes } from '~/integrations/http';

type Case = [string, string];

const LeadingCases: Case[] = [
  ['/api/skills', 'api/skills'],
  ['///api/skills', 'api/skills'],
  ['api/skills', 'api/skills'],
  ['api/skills/', 'api/skills/'],
  ['/', ''],
  ['///', ''],
  ['', ''],
];

const TrailingCases: Case[] = [
  ['/api/skills/', '/api/skills'],
  ['/api/skills///', '/api/skills'],
  ['/api/skills', '/api/skills'],
  ['//api//skills//', '//api//skills'],
  ['/', ''],
  ['///', ''],
  ['', ''],
];

describe('withoutLeadingSlashes()', () => {
  it.each(LeadingCases)('(url = %s)', (url, expected) => {
    expect(withoutLeadingSlashes(url)).toBe(expected);
  });
});

describe('withoutTrailingSlashes()', () => {
  it.each(TrailingCases)('(url = %s)', (url, expected) => {
    expect(withoutTrailingSlashes(url)).toBe(expected);
  });
});
