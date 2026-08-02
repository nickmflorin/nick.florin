import { type CSSProperties, type JSX, type Ref } from 'react';

import { PopoverContent, type PopoverContentProps } from '~/components/floating/PopoverContent';
import { classNames } from '~/components/types';

export interface SelectPopoverContentProps extends Omit<PopoverContentProps, 'children' | 'ref'> {
  readonly children: JSX.Element | null;
  readonly isInPortal?: boolean;
  readonly ref?: Ref<HTMLDivElement>;
}

/**
 * Computes the style applied to {@link PopoverContent}, which is needed for it to be positioned
 * correctly given the Popover component's prop injection.
 *
 * @param {boolean} isInPortal Whether the popover content is rendered inside a portal.
 * @param {CSSProperties} style Additional style overrides provided by the caller.
 *
 * @returns {CSSProperties} The style that should be applied to the PopoverContent element.
 */
const getSelectPopoverContentStyle = (
  isInPortal: SelectPopoverContentProps['isInPortal'],
  style: SelectPopoverContentProps['style'],
): CSSProperties => ({ zIndex: isInPortal ? 12 : 10, ...style });

export const SelectPopoverContent = ({
  children,
  isInPortal,
  ref,
  ...props
}: SelectPopoverContentProps) => (
  <PopoverContent
    {...props}
    className={classNames('p-0 border-none overflow-hidden', props.className)}
    ref={ref}
    style={getSelectPopoverContentStyle(isInPortal, props.style)}
  >
    {children}
  </PopoverContent>
);
