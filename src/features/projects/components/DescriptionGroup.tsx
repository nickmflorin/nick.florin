import { type JSX, type ReactNode, type Ref } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface DescriptionGroupProps extends ComponentProps {
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

export const DescriptionGroup = ({
  children,
  ref,
  ...props
}: DescriptionGroupProps): JSX.Element => (
  <div {...props} className={classNames('flex flex-col gap-[8px]', props.className)} ref={ref}>
    {children}
  </div>
);
