import { type Required } from "utility-types";

import { type NavItem } from "~/hooks";

export interface ILayoutNavItem extends Required<NavItem, "icon"> {
  readonly tooltipLabel: string;
  readonly children?: [Omit<ILayoutNavItem, "children">, ...Omit<ILayoutNavItem, "children">[]];
}

export type LayoutNavItemHasChildren<
  I extends ILayoutNavItem | Required<ILayoutNavItem, "children">,
> = I extends {
  children: [Omit<ILayoutNavItem, "children">, ...Omit<ILayoutNavItem, "children">[]];
}
  ? true
  : false;

export type IfLayoutNavItemHasChildren<
  T,
  I extends ILayoutNavItem | Required<ILayoutNavItem, "children">,
  R = never,
> = LayoutNavItemHasChildren<I> extends true ? T : R;

export const layoutNavItemHasChildren = (
  item: ILayoutNavItem | Required<ILayoutNavItem, "children">,
): item is Required<ILayoutNavItem, "children"> =>
  (item as Required<ILayoutNavItem, "children">).children !== undefined &&
  (item as Required<ILayoutNavItem, "children">).children.length !== 0;
