'use client';
import { type JSX, type MouseEvent, type Ref, useImperativeHandle, useState } from 'react';

import { omit, pick } from 'lodash-es';

import { Popover, type PopoverProps } from '~/components/floating/Popover';
import {
  type FloatingContentRenderProps,
  type PopoverRenderProps,
} from '~/components/floating/types';

export type SelectPopoverInstance = {
  readonly setOpen: (isOpen: boolean) => void;
};

interface InnerSelectPopoverProps extends Pick<
  PopoverProps,
  | 'allowedPlacements'
  | 'autoUpdate'
  | 'isDisabled'
  | 'isInPortal'
  | 'maxHeight'
  | 'offset'
  | 'placement'
  | 'width'
> {
  readonly children: (params: { readonly isOpen: boolean } & PopoverRenderProps) => JSX.Element;
  readonly content: ((props: FloatingContentRenderProps) => JSX.Element | null) | JSX.Element;
  readonly isReady?: boolean;
  readonly onClose?: (
    e: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>,
  ) => void;
  readonly onOpen?: (e: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
  readonly onOpenChange?: (
    e: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>,
    isOpen: boolean,
  ) => void;
  readonly ref?: Ref<SelectPopoverInstance>;
}

/**
 * The default value applied to {@link Popover}'s `autoUpdate` prop, used unless the caller
 * overrides it via `popoverAutoUpdate`.
 *
 * Enabling auto-update is particularly important for Select elements rendered inside Drawers,
 * because otherwise the Select's content menu does not receive its best placement (top or bottom)
 * from the `autoPlacement` middleware until the second time the Select is opened after the initial
 * render. It defaults to disabled because it can be a performance cost.
 */
const DefaultSelectPopoverAutoUpdate = false;

const InnerSelectPopover = ({
  children,
  content,
  isReady,
  maxHeight = '240px',
  offset = { mainAxis: 2 },
  ref,
  width = 'target',
  ...props
}: InnerSelectPopoverProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    setOpen: setIsOpen,
  }));

  return (
    <Popover
      allowedPlacements={['bottom', 'top']}
      autoUpdate={DefaultSelectPopoverAutoUpdate}
      {...props}
      content={typeof content === 'function' ? renderProps => content({ ...renderProps }) : content}
      hasArrow={false}
      isDisabled={isReady === false || props.isDisabled}
      isOpen={isOpen}
      maxHeight={maxHeight}
      offset={offset}
      onOpenChange={(nextIsOpen, evt) => {
        setIsOpen(nextIsOpen);
        props.onOpenChange?.(evt, nextIsOpen);
      }}
      triggers={['click']}
      width={width}
    >
      {({ params, ref: _ref }) => children({ isOpen, params, ref: _ref })}
    </Popover>
  );
};

export interface SelectPopoverProps extends Pick<
  InnerSelectPopoverProps,
  'children' | 'content' | 'isInPortal' | 'isReady' | 'onClose' | 'onOpen' | 'onOpenChange'
> {
  readonly popoverAllowedPlacements?: InnerSelectPopoverProps['allowedPlacements'];
  readonly popoverAutoUpdate?: InnerSelectPopoverProps['autoUpdate'];
  readonly popoverMaxHeight?: InnerSelectPopoverProps['maxHeight'];
  readonly popoverOffset?: InnerSelectPopoverProps['offset'];
  readonly popoverPlacement?: InnerSelectPopoverProps['placement'];
  readonly popoverWidth?: InnerSelectPopoverProps['width'];
}

export const SelectPopoverPropsMap = {
  children: true,
  content: true,
  isInPortal: true,
  isReady: true,
  onClose: true,
  onOpen: true,
  onOpenChange: true,
  popoverAllowedPlacements: true,
  popoverAutoUpdate: true,
  popoverMaxHeight: true,
  popoverOffset: true,
  popoverPlacement: true,
  popoverWidth: true,
} as const satisfies {
  [key in keyof Required<SelectPopoverProps>]: true;
};

export const omitSelectPopoverProps = <P extends Record<string, unknown>>(
  props: P,
): Omit<P, keyof P & keyof typeof SelectPopoverPropsMap> =>
  omit(props, Object.keys(SelectPopoverPropsMap) as (keyof Required<SelectPopoverProps>)[]);

export const pickSelectPopoverProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, keyof P & keyof typeof SelectPopoverPropsMap> =>
  pick(props, Object.keys(SelectPopoverPropsMap) as (keyof Required<SelectPopoverProps>)[]);

export const SelectPopover = ({
  popoverAllowedPlacements,
  popoverAutoUpdate,
  popoverMaxHeight,
  popoverOffset,
  popoverPlacement,
  popoverWidth,
  ref,
  ...props
}: { readonly ref?: Ref<SelectPopoverInstance> } & SelectPopoverProps): JSX.Element => (
  <InnerSelectPopover
    {...props}
    allowedPlacements={popoverAllowedPlacements}
    autoUpdate={popoverAutoUpdate}
    maxHeight={popoverMaxHeight}
    offset={popoverOffset}
    placement={popoverPlacement}
    ref={ref}
    width={popoverWidth}
  />
);
