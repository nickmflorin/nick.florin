import { render, screen } from '@testing-library/react';

import { type DiscreteFontSize } from '~/components/types';
import { Title } from '~/components/typography/Title';

/* The mapping under test is `TitleFontSizeOrderMap`, restated here as the heading levels it is
   expected to produce so that a change to the map fails against a written-down expectation rather
   than against itself. */
const HeadingLevels: [DiscreteFontSize, number][] = [
  ['xl', 1],
  ['lg', 2],
  ['md', 3],
  ['smplus', 4],
  ['sm', 5],
  ['xs', 6],
  ['xxs', 6],
  ['xxxs', 6],
];

describe('<Title />', () => {
  it.each(HeadingLevels)('maps the "%s" font size to heading level %s', (fontSize, level) => {
    render(<Title fontSize={fontSize}>Senior Engineer</Title>);
    expect(screen.getByRole('heading', { level })).toHaveTextContent('Senior Engineer');
  });

  it('renders an h3 when no font size is provided', () => {
    render(<Title>Senior Engineer</Title>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders an h3 when the font size is not a discrete one', () => {
    render(<Title fontSize='inherit'>Senior Engineer</Title>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders the component it is given, in preference to the one the font size implies', () => {
    render(
      <Title component='h4' fontSize='xl'>
        Senior Engineer
      </Title>,
    );
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
  });
});
