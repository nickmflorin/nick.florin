'use client';
import {
  type Dispatch,
  type HTMLProps,
  type ReactNode,
  type SetStateAction,
  useId,
  useLayoutEffect,
} from 'react';

import { useDialogContext } from '~/components/dialogs/hooks/use-dialog-context';
import { classNames, type ComponentProps } from '~/components/types';

import { DialogDescription } from './DialogDescription';

export interface DialogContentProps
  extends ComponentProps, Omit<HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: ReactNode;
}

/**
 * Registers `id` as the Dialog's content id via `setContentId` for as long as the calling
 * component remains mounted, so that the Dialog root only sets `aria-describedby` when
 * {@link DialogContent} is mounted inside of it.
 */
const useRegisterDialogContentId = (
  id: string,
  setContentId: Dispatch<SetStateAction<string | undefined>>,
) => {
  useLayoutEffect(() => {
    setContentId(id);
    return () => setContentId(undefined);
  }, [id, setContentId]);
};

export const DialogContent = ({ children, ref, ...props }: DialogContentProps) => {
  const { setContentId } = useDialogContext();
  const id = useId();

  useRegisterDialogContentId(id, setContentId);

  return (
    <div {...props} className={classNames('dialog__content', props.className)} ref={ref}>
      {typeof children === 'string' ? <DialogDescription>{children}</DialogDescription> : children}
    </div>
  );
};
