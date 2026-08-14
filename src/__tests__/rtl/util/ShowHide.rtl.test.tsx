import { render, screen } from '@testing-library/react';

import { ShowHide } from '~/components/util/ShowHide';

describe('<ShowHide />', () => {
  it('renders its children when "show" is true', () => {
    render(<ShowHide show>Experience</ShowHide>);
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('renders nothing when "show" is false', () => {
    render(<ShowHide show={false}>Experience</ShowHide>);
    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
  });

  it('renders nothing when "hide" is true', () => {
    render(<ShowHide hide>Experience</ShowHide>);
    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
  });

  it('renders its children when "hide" is false', () => {
    render(<ShowHide hide={false}>Experience</ShowHide>);
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('renders no wrapping element of its own around the children it shows', () => {
    const { container } = render(<ShowHide show>Experience</ShowHide>);
    /* The children reach the DOM with nothing around them, which is the whole contract of a
       component that renders a fragment. */
    expect(container.innerHTML).toBe('Experience');
  });
});
