'use client';
import {
  type Dispatch,
  type HTMLProps,
  type JSX,
  type Ref,
  type SetStateAction,
  useId,
  useLayoutEffect,
} from 'react';

import { useDialogContext } from '~/components/dialogs/hooks/use-dialog-context';
import { classNames, type ComponentProps } from '~/components/types';
import { Title } from '~/components/typography';

export interface DialogTitleProps
  extends ComponentProps, Omit<HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: JSX.Element | string;
  readonly ref?: Ref<HTMLDivElement>;
}

/**
 * Registers `id` as the Dialog's title id via `setTitleId` for as long as the calling component
 * remains mounted, so that the Dialog root only sets `aria-labelledby` when {@link DialogTitle} is
 * mounted inside of it.
 */
const useRegisterDialogTitleId = (
  id: string,
  setTitleId: Dispatch<SetStateAction<string | undefined>>,
) => {
  useLayoutEffect(() => {
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [id, setTitleId]);
};

export const DialogTitle = ({ children, ref, ...props }: DialogTitleProps) => {
  const { setTitleId } = useDialogContext();
  const id = useId();

  useRegisterDialogTitleId(id, setTitleId);

  return (
    <div {...props} className={classNames('dialog__title', props.className)} ref={ref}>
      {typeof children === 'string' ? <Title component='h3'>{children}</Title> : children}
    </div>
  );
};
