import { type Required } from "utility-types";

import { type NavItem } from "~/application/pages";

export interface IInternalGroupedLayoutNavItem extends Required<NavItem, "icon"> {
  readonly tooltipLabel: string;
  readonly visible?: boolean;
  readonly href?: never;
  readonly children: [IInternalLayoutNavItem, ...IInternalLayoutNavItem[]];
}

export interface IInternalLayoutNavItem extends Required<NavItem, "icon"> {
  readonly tooltipLabel: string;
  readonly visible?: boolean;
  readonly href?: never;
  readonly children?: never;
}

export interface IExternalLayoutNavItem extends Required<Pick<NavItem, "icon">, "icon"> {
  readonly children?: never;
  readonly tooltipLabel: string;
  readonly visible?: boolean;
  readonly href: string;
  readonly path?: never;
  readonly active?: never;
}

export type ILayoutNavItem =
  | IInternalLayoutNavItem
  | IExternalLayoutNavItem
  | IInternalGroupedLayoutNavItem;

export const layoutNavItemIsExternal = (
  navItem: ILayoutNavItem,
): navItem is IExternalLayoutNavItem => (navItem as IExternalLayoutNavItem).href !== undefined;

export type LayoutNavItemHasChildren<I extends ILayoutNavItem> = I extends {
  children: [IInternalLayoutNavItem, ...IInternalLayoutNavItem[]];
}
  ? true
  : false;

export const layoutNavItemHasChildren = (
  item: ILayoutNavItem,
): item is IInternalGroupedLayoutNavItem =>
  (item as IInternalGroupedLayoutNavItem).children !== undefined &&
  (item as IInternalGroupedLayoutNavItem).children.filter(child => child.visible !== false)
    .length !== 0;

export const flattenLayoutNavItems = (
  items: ILayoutNavItem[],
): Exclude<ILayoutNavItem, IInternalGroupedLayoutNavItem>[] =>
  items.reduce(
    (acc, item) => {
      if (layoutNavItemHasChildren(item)) {
        return [...acc, ...item.children];
      }
      return [...acc, item];
    },
    [] as Exclude<ILayoutNavItem, IInternalGroupedLayoutNavItem>[],
  );
