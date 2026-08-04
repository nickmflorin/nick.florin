'use client';
import { Fragment, type JSX, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { AnimateChangeInHeight } from '~/components/animations/AnimateChangeInHeight';
import { ShowMoreLink } from '~/components/buttons/ShowMoreLink';
import {
  classNames,
  type ComponentProps,
  type ContainerSizeRangeMap,
  getFromContainerSizeRangeMap,
  parseDataAttributes,
  type ScreenSizeRangeMap,
  type TypographyVisibilityState,
} from '~/components/types';
import { BaseTypography, type BaseTypographyProps } from '~/components/typography/BaseTypography';
import { useContainerSizes } from '~/hooks/use-screen-sizes';

import { type BadgeSize } from './types';

export interface BadgeCollectionChildrenProps
  extends
    ComponentProps,
    Omit<
      BaseTypographyProps<'div'>,
      'align' | 'children' | 'component' | 'lineClamp' | 'truncate'
    > {
  readonly children: JSX.Element[];
  readonly data?: never;
  readonly maximumBadges?: ContainerSizeRangeMap<number> | number;
  readonly size?: BadgeSize;
}

export interface BadgeCollectionCallbackProps<M>
  extends
    ComponentProps,
    Omit<
      BaseTypographyProps<'div'>,
      'align' | 'children' | 'component' | 'lineClamp' | 'truncate'
    > {
  readonly children: (model: M) => JSX.Element;
  readonly data: M[];
  readonly maximumBadges?: number | ScreenSizeRangeMap<number>;
  readonly size?: BadgeSize;
}

const partitionChildren = ({
  children,
  containerSize,
  maximumBadges,
}: {
  readonly containerSize: null | number;
} & Pick<BadgeCollectionChildrenProps, 'children' | 'maximumBadges'>): [
  JSX.Element[],
  JSX.Element[],
] => {
  if (maximumBadges !== undefined && containerSize !== null) {
    const maxBadges =
      typeof maximumBadges === 'number'
        ? maximumBadges
        : getFromContainerSizeRangeMap(containerSize, maximumBadges);
    if (maxBadges !== null) {
      return [children.slice(0, maxBadges), children.slice(maxBadges)];
    }
  }
  return [children, []];
};

export type BadgeCollectionProps<M> =
  BadgeCollectionCallbackProps<M> | BadgeCollectionChildrenProps;

export const BadgeCollection = <M,>({
  children,
  data,
  ...props
}: BadgeCollectionProps<M>): JSX.Element | null => {
  const [state, setState] = useState<TypographyVisibilityState>('collapsed');
  const { ref, size: containerSize } = useContainerSizes<HTMLDivElement>();

  if (data !== undefined) {
    return (
      <BadgeCollection {...props}>
        {data.map((datum, i) => (
          <Fragment key={i}>{children(datum)}</Fragment>
        ))}
      </BadgeCollection>
    );
  } else if (typeof children === 'function') {
    throw new TypeError('Invalid function implementation!');
  } else if (children.length === 0) {
    return null;
  }
  const { maximumBadges, size, ...rest } = props;
  const partition = partitionChildren({
    children,
    containerSize,
    maximumBadges,
  });
  return (
    <BaseTypography
      {...rest}
      {...parseDataAttributes({ size })}
      className={classNames('badge-collection', props.className)}
      component='div'
      ref={ref}
    >
      <AnimateChangeInHeight className='badge-collection__badges'>
        {partition[0]}
        {partition[1].map((child, i) => (
          <AnimatePresence key={i}>
            {state === 'expanded' ? (
              <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
                {child}
              </motion.div>
            ) : null}
          </AnimatePresence>
        ))}
      </AnimateChangeInHeight>
      {partition[1].length === 0 ? null : (
        <ShowMoreLink
          onClick={() => setState(curr => (curr === 'collapsed' ? 'expanded' : 'collapsed'))}
          state={state}
        />
      )}
    </BaseTypography>
  );
};
