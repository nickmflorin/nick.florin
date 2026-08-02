'use client';
import type * as types from './types';

import { Tooltip } from '~/components/floating/Tooltip';
import {
  type IExternalSidebarItem,
  type IInternalSidebarItem,
  sidebarItemIsExternal,
} from '~/components/layout';
import { classNames } from '~/components/types';
import { useNavigationItem } from '~/hooks';

import { IconButton, type IconButtonProps } from './generic';

export type InternalSidebarAnchorProps = {
  readonly item: Omit<IInternalSidebarItem, 'children'>;
  readonly ref?: types.PolymorphicButtonRef<'link'>;
} & Omit<IconButtonProps<'link'>, 'element' | 'href' | 'icon' | 'isActive' | 'options'>;

export type ExternalSidebarAnchorProps = {
  readonly item: IExternalSidebarItem;
  readonly ref?: types.PolymorphicButtonRef<'a'>;
} & Omit<IconButtonProps<'a'>, 'element' | 'href' | 'icon' | 'isActive' | 'options'>;

export const InternalSidebarAnchor = ({ item, ref, ...props }: InternalSidebarAnchorProps) => {
  const { href, isActive, isPending, setNavigating } = useNavigationItem(item);
  return (
    <IconButton.Solid<'link'>
      {...props}
      activeClassName='bg-blue-800 outline-blue-800 text-white'
      className={classNames(
        'z-0 text-body outline-transparent bg-transparent w-full h-full',
        { ['hover:bg-gray-300 hover:outline-gray-300']: !isActive },
        props.className,
      )}
      element='link'
      href={href}
      icon={item.icon}
      iconSize='medium'
      isActive={isActive}
      isLoading={isPending}
      onClick={() => setNavigating()}
      ref={ref}
      size='xlarge'
    />
  );
};

export const ExternalSidebarAnchor = ({ item, ref, ...props }: ExternalSidebarAnchorProps) => (
  <IconButton.Solid<'a'>
    {...props}
    className={classNames(
      'z-0 text-body outline-transparent bg-transparent w-full h-full',
      'hover:bg-gray-300 hover:outline-gray-300',
      props.className,
    )}
    element='a'
    href={item.href}
    icon={item.icon}
    iconSize='medium'
    openInNewTab
    ref={ref}
    size='xlarge'
  />
);

export type SidebarAnchorProps<
  I extends IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'> =
    IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'>,
> = {
  readonly item: I;
  readonly ref?: types.PolymorphicButtonRef<'a'>;
} & Omit<IconButtonProps<'a' | 'link'>, 'href' | 'icon' | 'isActive' | 'options'>;

/**
 * Renders the {@link Tooltip} of the {@link SidebarAnchor} in a portal, which prevents glitches
 * associated with the tooltip shifting around to incorrect locations when the position of the
 * sidebar items changes due to hovering of a parent sidebar item with children.  It also prevents a
 * bug related to the tooltip's opacity that makes it look semi-transparent, although the reason a
 * portal fixes that problem is less clear.
 */
const SidebarAnchorTooltipIsInPortal = true;

export const SidebarAnchor = <
  I extends IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'>,
>({
  item,
  ref: forwardedRef,
  ...props
}: SidebarAnchorProps<I>) => (
  <Tooltip content={item.label} isInPortal={SidebarAnchorTooltipIsInPortal} placement='right'>
    {({ params, ref }) => {
      if (sidebarItemIsExternal(item)) {
        return (
          <ExternalSidebarAnchor
            {...(props as ExternalSidebarAnchorProps)}
            {...params}
            item={item}
            ref={instance => {
              ref(instance);
              if (typeof forwardedRef === 'function') {
                forwardedRef(instance);
              } else if (forwardedRef) {
                forwardedRef.current = instance;
              }
            }}
          />
        );
      }
      return (
        <InternalSidebarAnchor
          {...(props as InternalSidebarAnchorProps)}
          {...params}
          item={item}
          ref={instance => {
            ref(instance);
            if (typeof forwardedRef === 'function') {
              forwardedRef(instance);
            } else if (forwardedRef) {
              forwardedRef.current = instance;
            }
          }}
        />
      );
    }}
  </Tooltip>
);
