import { type ReactNode } from 'react';

import { Loading } from '~/components/loading/Loading';
import { classNames, type ComponentProps } from '~/components/types';
import { Disabled } from '~/components/util';

export interface FormBodyProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly contentClassName?: ComponentProps['className'];
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isScrollable?: boolean;
}

export const FormBody = ({
  children,
  contentClassName,
  isDisabled = false,
  isLoading = false,
  isScrollable = true,
  ...props
}: FormBodyProps) => (
  <div
    {...props}
    className={classNames(
      'flex flex-col grow relative',
      { 'overflow-y-auto pr-[18px]': isScrollable },
      props.className,
    )}
  >
    <Loading isLoading={isLoading}>
      <Disabled
        className={classNames('flex flex-col gap-[8px]', contentClassName)}
        isDisabled={isDisabled}
      >
        {children}
      </Disabled>
    </Loading>
  </div>
);
