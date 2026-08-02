import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';
import { type Required } from 'utility-types';

import { clerkUserIsAdmin, type UserResource } from '~/application/auth/roles';
import { type LabeledNavItem } from '~/application/pages';

export const SidebarItemAccessTypes = enumeratedLiterals(['admin'] as const, {});
export type SidebarItemAccessType = EnumeratedLiteralsMember<typeof SidebarItemAccessTypes>;

export interface IInternalGroupedSidebarItem extends Required<LabeledNavItem, 'icon'> {
  readonly accessType?: SidebarItemAccessType;
  readonly children: [IInternalSidebarItem, ...IInternalSidebarItem[]];
  readonly href?: never;
  readonly visible?: boolean;
}

export interface IInternalSidebarItem extends Required<LabeledNavItem, 'icon'> {
  readonly accessType?: SidebarItemAccessType;
  readonly children?: never;
  readonly href?: never;
  readonly visible?: boolean;
}

export interface IExternalSidebarItem extends Required<
  Pick<LabeledNavItem, 'icon' | 'label'>,
  'icon'
> {
  readonly accessType?: never;
  readonly active?: never;
  readonly children?: never;
  readonly href: string;
  readonly path?: never;
  readonly visible?: boolean;
}

export type ISidebarItem =
  IExternalSidebarItem | IInternalGroupedSidebarItem | IInternalSidebarItem;

export const sidebarItemIsExternal = (navItem: ISidebarItem): navItem is IExternalSidebarItem =>
  navItem.href !== undefined;

export type SidebarItemHasChildren<I extends ISidebarItem> = I extends {
  children: [IInternalSidebarItem, ...IInternalSidebarItem[]];
}
  ? true
  : false;

export const sidebarItemHasChildren = (item: ISidebarItem): item is IInternalGroupedSidebarItem =>
  item.children !== undefined &&
  item.children.filter(child => child.visible !== false).length !== 0;

export const flattenSidebarItems = (
  items: ISidebarItem[],
): Exclude<ISidebarItem, IInternalGroupedSidebarItem>[] =>
  items.reduce(
    (acc, item) => {
      if (sidebarItemHasChildren(item)) {
        return [...acc, ...item.children];
      }
      return [...acc, item];
    },
    [] as Exclude<ISidebarItem, IInternalGroupedSidebarItem>[],
  );

export const sidebarItemIsVisible = (
  item: ISidebarItem,
  user: null | undefined | UserResource,
): boolean => {
  if (sidebarItemIsExternal(item)) {
    return item.visible ?? true;
  } else if (item.visible === false) {
    return false;
  } else if (item.accessType === SidebarItemAccessTypes.ADMIN) {
    return user !== null && user !== undefined && clerkUserIsAdmin(user);
  }
  return true;
};
