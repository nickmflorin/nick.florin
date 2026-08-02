import Image from 'next/image';
import { type JSX, type ReactNode } from 'react';

import {
  classNames,
  type ComponentProps,
  inferQuantitativeSizeValue,
  type QuantitativeSize,
} from '~/components/types';
import { Description } from '~/components/typography';

export interface EmptyMessageProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly imageSize?: QuantitativeSize<'px'>;
}

export const EmptyMessage = ({
  children,
  imageSize = 72,
  ...props
}: EmptyMessageProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      'flex flex-col items-center justify-center gap-6 max-w-[280px] p-2',
      props.className,
    )}
  >
    <Image
      alt='Empty'
      height={inferQuantitativeSizeValue(imageSize)}
      src='/empty.svg'
      width={inferQuantitativeSizeValue(imageSize)}
    />
    <Description align='center' fontSize='sm' fontWeight='regular'>
      {children}
    </Description>
  </div>
);
