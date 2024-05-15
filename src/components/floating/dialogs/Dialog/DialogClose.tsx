import { forwardRef } from "react";

import {
  DialogCloseButton,
  type DialogCloseButtonProps,
} from "~/components/buttons/DialogCloseButton";

import { useDialogContext } from "../../hooks/use-dialog-context";

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseButtonProps>((props, ref) => {
  const { setIsOpen } = useDialogContext();
  return (
    <DialogCloseButton
      {...props}
      ref={ref}
      onClick={e => {
        setIsOpen(false, e);
        props.onClick?.(e);
      }}
    />
  );
});
