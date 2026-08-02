import { type JSX, type ComponentProps as ReactComponentProps, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export type NativeFormProps = {
  readonly children: ReactNode;
} & ComponentProps &
  Pick<ReactComponentProps<'form'>, 'action' | 'onSubmit'>;

/**
 * Wraps `onSubmit` so that `preventDefault()` is only called on the event when a handler is
 * provided.
 *
 * If `preventDefault()` is called on the event while no `onSubmit` handler is defined, the server
 * actions on a `Form` will not be called.
 */
const getFormOnSubmitHandler = (
  onSubmit: NativeFormProps['onSubmit'],
): NativeFormProps['onSubmit'] =>
  onSubmit === undefined
    ? undefined
    : e => {
        e.preventDefault();
        onSubmit(e);
      };

export const NativeForm = ({ children, ...props }: NativeFormProps): JSX.Element => (
  <form
    {...props}
    className={classNames(props.className)}
    onSubmit={getFormOnSubmitHandler(props.onSubmit)}
  >
    {children}
  </form>
);
