import { humanizeList } from '~/lib/formatters';

type Case = [string[], string];

const DefaultCases: Case[] = [
  [[], ''],
  [['react'], 'react'],
  [['react', 'vue'], 'react and vue'],
  [['react', 'vue', 'svelte'], 'react, vue, and svelte'],
  [['react', 'vue', 'svelte', 'solid'], 'react, vue, svelte, and solid'],
];

/* The oxford comma only applies from three elements onward, so the two-element case must read
   identically whether or not it is enabled. */
const WithoutOxfordCommaCases: Case[] = [
  [['react', 'vue'], 'react and vue'],
  [['react', 'vue', 'svelte'], 'react, vue and svelte'],
  [['react', 'vue', 'svelte', 'solid'], 'react, vue, svelte and solid'],
];

describe('humanizeList()', () => {
  it.each(DefaultCases)(
    'joins with a conjunction and an oxford comma (values = %s)',
    (values, expected) => {
      expect(humanizeList(values)).toBe(expected);
    },
  );

  it.each(WithoutOxfordCommaCases)(
    'omits the oxford comma when it is disabled (values = %s)',
    (values, expected) => {
      expect(humanizeList(values, { oxfordComma: false })).toBe(expected);
    },
  );

  it('uses the conjunction it is given', () => {
    expect(humanizeList(['react', 'vue', 'svelte'], { conjunction: 'or' })).toBe(
      'react, vue, or svelte',
    );
  });

  it('uses the delimiter it is given, for the separators and the oxford comma alike', () => {
    expect(humanizeList(['react', 'vue', 'svelte'], { delimiter: ';' })).toBe(
      'react; vue; and svelte',
    );
  });

  it('trims a delimiter that arrives with its own spacing, so the spacing is not doubled', () => {
    expect(humanizeList(['react', 'vue', 'svelte'], { delimiter: ' , ' })).toBe(
      'react, vue, and svelte',
    );
  });

  it('applies the formatter to every element, including the last', () => {
    expect(humanizeList([1, 2, 3], { formatter: value => `#${value}` })).toBe('#1, #2, and #3');
  });

  it('applies the formatter to a single element, which takes no conjunction at all', () => {
    expect(humanizeList(['react'], { formatter: value => value.toUpperCase() })).toBe('REACT');
  });
});
