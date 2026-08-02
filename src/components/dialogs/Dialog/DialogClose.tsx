import { type JSX } from 'react';

import {
  DialogCloseButton,
  type DialogCloseButtonProps,
} from '~/components/buttons/DialogCloseButton';
import { useDialogContext } from '~/components/dialogs/hooks/use-dialog-context';

export const DialogClose = ({ ref, ...props }: DialogCloseButtonProps): JSX.Element => {
  const { setIsOpen } = useDialogContext();
  return (
    <DialogCloseButton
      {...props}
      onClick={e => {
        setIsOpen(false, e);
        props.onClick?.(e);
      }}
      ref={ref}
    />
  );
};
