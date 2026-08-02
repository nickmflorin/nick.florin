import { type JSX } from 'react';

import { type FloatingContentRenderProps } from '~/components/floating';
import { Popover, type PopoverProps } from '~/components/floating/Popover';
import { PopoverContent } from '~/components/floating/PopoverContent';
import { classNames, type ComponentProps } from '~/components/types';

export interface DropdownMenuProps extends Pick<
  PopoverProps,
  | 'allowedPlacements'
  | 'autoUpdate'
  | 'children'
  | 'hasArrow'
  | 'isDisabled'
  | 'isInPortal'
  | 'maxHeight'
  | 'middleware'
  | 'offset'
  | 'placement'
  | 'triggers'
  | 'width'
> {
  readonly content:
    | ((params: Pick<FloatingContentRenderProps, 'isOpen' | 'setIsOpen'>) => JSX.Element)
    | JSX.Element;
  readonly contentClassName?: ComponentProps['className'];
  readonly contentStyle?: ComponentProps['style'];
}

export const DropdownMenu = ({
  children,
  content,
  contentClassName,
  contentStyle,
  offset = { mainAxis: 4 },
  placement = 'bottom',
  triggers = ['click'],
  ...props
}: DropdownMenuProps) => (
  <Popover
    {...props}
    content={({ isOpen, params, ref, setIsOpen, styles }) => (
      <PopoverContent
        ref={ref}
        {...params}
        className={classNames('p-[0px] rounded-md overflow-hidden', contentClassName)}
        style={{ ...contentStyle, ...styles }}
      >
        {typeof content === 'function' ? content({ isOpen, setIsOpen }) : content}
      </PopoverContent>
    )}
    offset={offset}
    placement={placement}
    triggers={triggers}
  >
    {children}
  </Popover>
);
