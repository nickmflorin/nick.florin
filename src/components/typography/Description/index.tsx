'use client';
import { type JSX, type ReactNode, useMemo } from 'react';

import { type QuantitativeSize, sizeToString } from '~/components/types/sizes';
import { useControlledTypographyVisibility } from '~/components/typography/hooks';

import {
  type DescriptionComponent,
  DescriptionNode,
  type DescriptionNodeProps,
} from './DescriptionNode';
import { WithShowMore } from './WithShowMore';

const splitChildNodeString = (child: string, options: { lineBreakHeight?: QuantitativeSize }) => {
  if (child.includes('\n')) {
    const filtered = child.split('\n').filter(p => Boolean(p));
    return filtered.flatMap((c, index) =>
      index === filtered.length - 1
        ? c.trim()
        : [
            c.trim(),
            <span
              className='block'
              key={`break_${index}`}
              style={{ height: sizeToString(options.lineBreakHeight ?? 6, 'px') }}
            />,
          ],
    );
  }
  return [child];
};

export type DescriptionProps<C extends DescriptionComponent> = {
  readonly isShowMoreLinkVisible?: boolean;
  readonly lineBreakHeight?: QuantitativeSize;
} & DescriptionNodeProps<C>;

/**
 * Determines whether a {@link ReactNode} is an array of nodes.
 *
 * `Array.isArray` narrows a {@link ReactNode} to `any[]`, because the type includes an iterable of
 * nodes, which leaks an `any` into everything the narrowed value flows through. This predicate
 * performs the same runtime check while narrowing to the honest `ReactNode[]`.
 */
const isReactNodeArray = (value: ReactNode): value is ReactNode[] => Array.isArray(value);

export const Description = <C extends DescriptionComponent>({
  children,
  isShowMoreLinkVisible = false,
  lineBreakHeight = 6,
  ...props
}: DescriptionProps<C>): JSX.Element | null => {
  const { isTruncated, ref, state, toggle } = useControlledTypographyVisibility({});

  const nodes = useMemo(
    () =>
      (isReactNodeArray(children) ? children : [children]).reduce(
        (acc: ReactNode[], child: ReactNode): ReactNode[] => {
          if (isReactNodeArray(child)) {
            return [
              ...acc,
              ...child
                .filter((c): c is ReactNode => Boolean(c))
                .reduce(
                  (childAcc: ReactNode[], c) => [
                    ...childAcc,
                    ...(typeof c === 'string' ? splitChildNodeString(c, { lineBreakHeight }) : [c]),
                  ],
                  [],
                ),
            ];
          } else if (typeof child === 'string') {
            return [...acc, ...splitChildNodeString(child, { lineBreakHeight })];
          } else if (child) {
            return [...acc, child];
          }
          return acc;
        },
        [] as ReactNode[],
      ),
    [children, lineBreakHeight],
  );

  if (nodes.length !== 0) {
    return (
      <WithShowMore
        isShowMoreLinkVisible={isShowMoreLinkVisible}
        isTruncated={isTruncated}
        onToggle={toggle}
        state={state}
      >
        <DescriptionNode
          {...props}
          lineClamp={state === 'expanded' ? undefined : props.lineClamp}
          ref={ref}
        >
          {nodes}
        </DescriptionNode>
      </WithShowMore>
    );
  }
  return null;
};
