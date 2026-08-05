import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';
import { type Required } from 'utility-types';

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

/**
 * Returns whether a sidebar item should be rendered for the current visitor.
 *
 * @param {ISidebarItem} item The sidebar item whose visibility is being determined.
 * @param {boolean} isAdmin
 *   Whether the current visitor has admin CMS access.  This is derived on the server (via Clerk's
 *   `auth()` helper) rather than from client-side Clerk context, so that rendering the sidebar
 *   does not require `<ClerkProvider />` to be mounted — anonymous visitors never load Clerk.
 *
 * @returns {boolean} Whether the item should be rendered.
 */
export const sidebarItemIsVisible = (item: ISidebarItem, isAdmin = false): boolean => {
  if (sidebarItemIsExternal(item)) {
    return item.visible ?? true;
  } else if (item.visible === false) {
    return false;
  } else if (item.accessType === SidebarItemAccessTypes.ADMIN) {
    return isAdmin;
  }
  return true;
};
