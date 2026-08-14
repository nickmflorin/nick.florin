import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Actions } from '~/components/structural/Actions';

describe('<Actions />', () => {
  it('renders each of the actions it is given', () => {
    render(
      <Actions
        actions={[
          <button key='edit' type='button'>
            Edit
          </button>,
          <button key='delete' type='button'>
            Delete
          </button>,
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders the actions it is given as children', () => {
    render(
      <Actions>
        <button type='button'>Edit</button>
      </Actions>,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders nothing at all when it is given no actions', () => {
    const { container } = render(<Actions actions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing at all when every action it is given is falsy', () => {
    const { container } = render(<Actions actions={[null, false, undefined]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('discards the falsy actions and renders the rest', () => {
    render(
      <Actions
        actions={[
          null,
          <button key='edit' type='button'>
            Edit
          </button>,
          undefined,
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('discards a fragment, which is not renderable as a single action', () => {
    const { container } = render(<Actions actions={[<>Edit</>]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('runs the click handler on the action itself', async () => {
    expect.assertions(1);

    const onEdit = jest.fn();
    render(
      <Actions
        actions={[
          <button key='edit' onClick={onEdit} type='button'>
            Edit
          </button>,
        ]}
      />,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('stops a click on an action from reaching a handler above it', async () => {
    expect.assertions(2);

    const onEdit = jest.fn();
    const onContainerClick = jest.fn();
    render(
      <div onClick={onContainerClick} role='presentation'>
        <Actions
          actions={[
            <button key='edit' onClick={onEdit} type='button'>
              Edit
            </button>,
          ]}
        />
      </div>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onContainerClick).toHaveBeenCalledTimes(0);
  });
});
