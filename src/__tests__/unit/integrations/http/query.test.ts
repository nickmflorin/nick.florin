import { addQueryParamsToUrl, getQueryParams } from '~/integrations/http';

/**
 * Returns the provided query parameters on an object without a prototype, which is the exact form
 * that {@link getQueryParams} returns when the URL actually contains a query string, because it
 * parses that query string with Node's `querystring` module.
 */
const parsedParams = (params: Record<string, string>): Record<string, string> =>
  Object.assign(Object.create(null) as Record<string, string>, params);

describe('getQueryParams() properly returns', () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const CASES: [string, Record<string, any>][] = [
    [
      'https://nickflorin.com/api/skills?search=myskill&pageSize=10&page=4',
      parsedParams({ page: '4', pageSize: '10', search: 'myskill' }),
    ],
    [
      'api/skills?search=myskill&pageSize=10&page=4',
      parsedParams({ page: '4', pageSize: '10', search: 'myskill' }),
    ],
    [
      '/api/skills?search=myskill&pageSize=&page=4',
      parsedParams({ page: '4', pageSize: '', search: 'myskill' }),
    ],
    ['https://nickflorin.com/api/skills', {}],
    ['https://nickflorin.com/api/skills?', {}],
    ['', {}],
  ];

  it.each(CASES)('(url = %s)', (url, expected) => {
    expect(getQueryParams(url)).toStrictEqual(expected);
  });
});

describe('addQueryParamsToUrl() properly returns', () => {
  const CASES: [Record<string, boolean | null | number | string | undefined>, string, string][] = [
    [
      { page: 4, pageSize: 10, search: 'myskill' },
      'https://nickflorin.com/api/skills',
      'https://nickflorin.com/api/skills?page=4&pageSize=10&search=myskill',
    ],
    [
      { page: 4, pageSize: null, search: 'myskill' },
      'https://nickflorin.com/api/skills?pageSize=10',
      'https://nickflorin.com/api/skills?page=4&pageSize=&search=myskill',
    ],
    [
      { page: 4, pageSize: 12, search: 'myskill' },
      'https://nickflorin.com/api/skills?filter=test&pageSize=10',
      'https://nickflorin.com/api/skills?page=4&pageSize=12&search=myskill',
    ],
    [
      { page: '', pageSize: 12, search: 'myskill' },
      'https://nickflorin.com/api/skills?filter=test&pageSize=10',
      'https://nickflorin.com/api/skills?page=&pageSize=12&search=myskill',
    ],
    [
      { page: undefined, pageSize: 12, search: 'myskill' },
      'https://nickflorin.com/api/skills?filter=test&pageSize=10',
      'https://nickflorin.com/api/skills?page=&pageSize=12&search=myskill',
    ],
  ];

  it.each(CASES)('(params = %s)', (params, url, expected) => {
    expect(addQueryParamsToUrl(url, params)).toBe(expected);
  });
});
