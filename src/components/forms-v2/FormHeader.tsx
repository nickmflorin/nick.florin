import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { Title } from '~/components/typography/Title';

export interface FormHeaderProps extends ComponentProps {
  readonly title?: ReactNode | string;
}

export const FormHeader = ({ title, ...props }: FormHeaderProps) => (
  <>
    {typeof title === 'string' ? (
      <Title {...props} className={classNames('mb-4', props.className)} component='h4'>
        {title}
      </Title>
    ) : title ? (
      <div {...props} className={classNames('flex flex-col mb-4', props.className)}>
        {title}
      </div>
    ) : null}
  </>
);
