import { type Required } from "utility-types";

import { type LabeledNavItem } from "~/application/pages";

export interface IInternalGroupedSidebarItem extends Required<LabeledNavItem, "icon"> {
  readonly visible?: boolean;
  readonly href?: never;
  readonly children: [IInternalSidebarItem, ...IInternalSidebarItem[]];
}

export interface IInternalSidebarItem extends Required<LabeledNavItem, "icon"> {
  readonly visible?: boolean;
  readonly href?: never;
  readonly children?: never;
}

export interface IExternalSidebarItem
  extends Required<Pick<LabeledNavItem, "icon" | "label">, "icon"> {
  readonly children?: never;
  readonly visible?: boolean;
  readonly href: string;
  readonly path?: never;
  readonly active?: never;
}

export type ISidebarItem =
  | IInternalSidebarItem
  | IExternalSidebarItem
  | IInternalGroupedSidebarItem;

export const sidebarItemIsExternal = (navItem: ISidebarItem): navItem is IExternalSidebarItem =>
  (navItem as IExternalSidebarItem).href !== undefined;

export type SidebarItemHasChildren<I extends ISidebarItem> = I extends {
  children: [IInternalSidebarItem, ...IInternalSidebarItem[]];
}
  ? true
  : false;

export const sidebarItemHasChildren = (item: ISidebarItem): item is IInternalGroupedSidebarItem =>
  (item as IInternalGroupedSidebarItem).children !== undefined &&
  (item as IInternalGroupedSidebarItem).children.filter(child => child.visible !== false).length !==
    0;

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
