import dynamic from 'next/dynamic';
import { type JSX, type ReactNode } from 'react';

import { type PopoverRenderProps } from '~/components/floating/types';
import { classNames } from '~/components/types';

import { type PopoverProps } from './Popover';
import { TooltipContent, type TooltipContentProps } from './TooltipContent';

const Popover = dynamic(() => import('./Popover').then(mod => mod.Popover));

export interface NonConditionalTooltipProps extends Omit<PopoverProps, 'content'> {
  readonly className?: TooltipContentProps['className'];
  readonly content: ReactNode;
  readonly isDisabled?: never;
  readonly isEnabled?: never;
}

export interface DisabledConditionalTooltipProps extends Omit<
  PopoverProps,
  'children' | 'content'
> {
  readonly children: ((params: Partial<PopoverRenderProps>) => JSX.Element) | JSX.Element;
  readonly className?: TooltipContentProps['className'];
  readonly content: ReactNode;
  readonly isDisabled: boolean;
  readonly isEnabled?: never;
}

export interface EnabledConditionalTooltipProps extends Omit<PopoverProps, 'children' | 'content'> {
  readonly children: ((params: Partial<PopoverRenderProps>) => JSX.Element) | JSX.Element;
  readonly className?: TooltipContentProps['className'];
  readonly content: ReactNode;
  readonly isDisabled?: never;
  readonly isEnabled: boolean;
}

export type TooltipProps =
  DisabledConditionalTooltipProps | EnabledConditionalTooltipProps | NonConditionalTooltipProps;

export const Tooltip = ({
  children,
  className,
  content,
  isDisabled,
  isEnabled,
  ...props
}: TooltipProps) => {
  if (isEnabled !== undefined || isDisabled !== undefined) {
    if (typeof children === 'function') {
      if (isEnabled === false || isDisabled === true) {
        return <>{children({ isOpen: undefined, params: undefined, ref: undefined })}</>;
      }
      return (
        <Popover
          {...props}
          content={
            <TooltipContent className={classNames('z-50', className)}>{content}</TooltipContent>
          }
        >
          {children}
        </Popover>
      );
    } else if (isEnabled === false || isDisabled === true) {
      return <>{children}</>;
    }
    return (
      <Popover
        {...props}
        content={
          <TooltipContent className={classNames('z-50', className)}>{content}</TooltipContent>
        }
      >
        {children}
      </Popover>
    );
  }
  return (
    <Popover
      {...props}
      content={<TooltipContent className={classNames('z-50', className)}>{content}</TooltipContent>}
    >
      {children}
    </Popover>
  );
};
