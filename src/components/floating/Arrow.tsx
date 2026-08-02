'use client';
import { type Ref } from 'react';

import { FloatingArrow, type FloatingContext } from '@floating-ui/react';

import { classNames, type ComponentProps } from '~/components/types';

export interface ArrowProps extends Pick<ComponentProps, 'className'> {
  readonly context: FloatingContext;
  readonly ref?: Ref<SVGSVGElement>;
}

export const Arrow = ({ className, context, ref }: ArrowProps) => (
  <FloatingArrow
    className={classNames(
      'fill-white',
      '[&>path:first-of-type]:stroke-white',
      '[&>path:last-of-type]:stroke-white',
      className,
    )}
    context={context}
    height={4}
    ref={ref}
    width={9}
  />
);
