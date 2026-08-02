import { type MouseEventHandler } from 'react';

import { IconButton } from '~/components/buttons';

export interface SaveActionProps {
  readonly id?: string;
  readonly isDisabled?: boolean;
  readonly isVisible?: boolean;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

export const SaveAction = ({ isVisible = true, onClick, ...props }: SaveActionProps) =>
  isVisible ? (
    <IconButton.Transparent
      {...props}
      className='text-green-600 hover:text-green-700 disabled:text-gray-400'
      icon={{ iconStyle: 'solid', name: 'circle-check' }}
      iconSize='16px'
      onClick={onClick}
      size='24px'
    />
  ) : null;
