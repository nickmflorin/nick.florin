'use client';
import type * as types from './types';

import {
  type IExternalSidebarItem,
  type IInternalSidebarItem,
  sidebarItemIsExternal,
} from '~/components/layout';
import { classNames } from '~/components/types';
import { useNavigationItem, useNavMenu } from '~/hooks';

import { Button, type ButtonProps } from './generic';

export type InternalNavMenuAnchorProps = {
  readonly item: Omit<IInternalSidebarItem, 'children'>;
  readonly ref?: types.PolymorphicButtonRef<'link'>;
} & Omit<ButtonProps<'link'>, 'element' | 'href' | 'icon' | 'isActive' | 'options'>;

export type ExternalNavMenuAnchorProps = {
  readonly item: IExternalSidebarItem;
  readonly ref?: types.PolymorphicButtonRef<'a'>;
} & Omit<ButtonProps<'a'>, 'element' | 'href' | 'icon' | 'isActive' | 'options'>;

export const InternalNavMenuAnchor = ({ item, ref, ...props }: InternalNavMenuAnchorProps) => {
  const { href, isActive, setNavigating } = useNavigationItem(item);
  const { close } = useNavMenu();
  return (
    <Button.Solid<'link'>
      {...props}
      activeClassName='bg-blue-800 outline-blue-800 text-white'
      className={classNames(
        'z-0 text-body outline-gray-50 bg-gray-50 w-full h-full',
        { ['hover:bg-gray-300 hover:outline-gray-300']: !isActive },
        props.className,
      )}
      element='link'
      fontSize='sm'
      href={href}
      icon={item.icon}
      iconSize='medium'
      isActive={isActive}
      onClick={() => {
        setNavigating();
        close();
      }}
      ref={ref}
      size='medium'
    >
      {item.label}
    </Button.Solid>
  );
};

export const ExternalNavMenuAnchor = ({ item, ref, ...props }: ExternalNavMenuAnchorProps) => (
  <Button.Solid<'a'>
    {...props}
    className={classNames(
      'z-0 text-body outline-gray-50 bg-gray-50 w-full h-full',
      'hover:bg-gray-300 hover:outline-gray-300',
      props.className,
    )}
    element='a'
    fontSize='sm'
    href={item.href}
    icon={item.icon}
    iconSize='medium'
    openInNewTab
    ref={ref}
    size='medium'
  >
    {item.label}
  </Button.Solid>
);

export type NavMenuAnchorProps<
  I extends IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'> =
    IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'>,
> = {
  readonly item: I;
  readonly ref?: types.PolymorphicButtonRef<'a'>;
} & Omit<ButtonProps<'a' | 'link'>, 'href' | 'icon' | 'isActive' | 'options'>;

export const NavMenuAnchor = <
  I extends IExternalSidebarItem | Omit<IInternalSidebarItem, 'children'>,
>({
  item,
  ref,
  ...props
}: NavMenuAnchorProps<I>) => {
  if (sidebarItemIsExternal(item)) {
    return (
      <ExternalNavMenuAnchor {...(props as ExternalNavMenuAnchorProps)} item={item} ref={ref} />
    );
  }
  return <InternalNavMenuAnchor {...(props as InternalNavMenuAnchorProps)} item={item} ref={ref} />;
};
