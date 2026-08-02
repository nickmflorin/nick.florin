import { type JSX } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { Text } from '~/components/typography/Text';

export interface FormFieldErrorProps extends ComponentProps {
  readonly children: string;
}

export const FormFieldError = ({ children, ...props }: FormFieldErrorProps): JSX.Element => (
  <Text {...props} className={classNames('text-danger-400', props.className)} fontSize='xs'>
    {children}
  </Text>
);
