import { type ComponentProps as ReactComponentProps } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface NativeInputProps
  extends Omit<ReactComponentProps<'input'>, 'disabled' | keyof ComponentProps>, ComponentProps {
  readonly isDisabled?: boolean;
}

export const NativeInput = ({ isDisabled, ref, ...props }: NativeInputProps) => (
  <input
    {...props}
    className={classNames('native-input', props.className)}
    disabled={isDisabled}
    ref={ref}
  />
);
