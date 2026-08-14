import { parseDataAttributes } from '~/components/types';

type Case = [Record<string, boolean | string | undefined>, Record<string, string | true>];

const Cases: Case[] = [
  [
    { isDisabled: false, isHidden: true, isLoading: true, radius: 'lg', size: ' ', variant: '' },
    { 'data-attr-hidden': true, 'data-attr-loading': true, 'data-attr-radius': 'lg' },
  ],
  [
    { disabled: false, hidden: true, isReadOnly: true, loading: true },
    { 'data-attr-hidden': true, 'data-attr-loading': true, 'data-attr-read-only': true },
  ],
  [{}, {}],
  [{ hidden: false, isDisabled: false, loading: false }, {}],
];

describe('parseDataAttributes()', () => {
  describe('parseDataAttributes() properly returns data attributes', () => {
    it.each(Cases)('(input = %s)', (input, expected) => {
      expect(parseDataAttributes(input)).toStrictEqual(expected);
    });
  });

  it('toDataAttributes() properly throws an error for invalid attributes', () => {
    expect(() => parseDataAttributes({ is9Loading: true })).toThrow(TypeError);
  });
});
