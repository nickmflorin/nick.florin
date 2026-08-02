import { type MouseEventHandler } from 'react';

import { IconButton } from '~/components/buttons';

export interface CancelActionProps {
  readonly id?: string;
  readonly isDisabled?: boolean;
  readonly isVisible?: boolean;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
}

export const CancelAction = ({ isVisible = true, onClick, ...props }: CancelActionProps) =>
  isVisible ? (
    <IconButton.Transparent
      {...props}
      className='text-red-500 hover:text-red-600 disabled:text-gray-400'
      icon={{ iconStyle: 'solid', name: 'circle-xmark' }}
      iconSize='16px'
      onClick={onClick}
      size='24px'
    />
  ) : null;
