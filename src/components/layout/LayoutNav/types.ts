import { type Required } from "utility-types";

import { type NavItem } from "~/application/pages";

export interface IInternalLayoutNavItem extends Required<NavItem, "icon"> {
  readonly tooltipLabel: string;
  readonly visible?: boolean;
  readonly href?: never;
  readonly children?: [
    Omit<IInternalLayoutNavItem, "children">,
    ...Omit<IInternalLayoutNavItem, "children">[],
  ];
}

export interface IExternalLayoutNavItem extends Required<Pick<NavItem, "icon">, "icon"> {
  readonly children?: never;
  readonly tooltipLabel: string;
  readonly visible?: boolean;
  readonly href: string;
  readonly path?: never;
  readonly active?: never;
}

export type ILayoutNavItem = IInternalLayoutNavItem | IExternalLayoutNavItem;

export const layoutNavItemIsExternal = (
  navItem: ILayoutNavItem,
): navItem is IExternalLayoutNavItem => (navItem as IExternalLayoutNavItem).href !== undefined;

export type LayoutNavItemHasChildren<
  I extends ILayoutNavItem | Required<ILayoutNavItem, "children">,
> = I extends {
  children: [
    Omit<IInternalLayoutNavItem, "children">,
    ...Omit<IInternalLayoutNavItem, "children">[],
  ];
}
  ? true
  : false;

export type IfLayoutNavItemHasChildren<
  T,
  I extends ILayoutNavItem | Required<ILayoutNavItem, "children">,
  R = never,
> = LayoutNavItemHasChildren<I> extends true ? T : R;

export const layoutNavItemHasChildren = (
  item: IInternalLayoutNavItem | Required<IInternalLayoutNavItem, "children">,
): item is Required<IInternalLayoutNavItem, "children"> =>
  (item as Required<IInternalLayoutNavItem, "children">).children !== undefined &&
  (item as Required<IInternalLayoutNavItem, "children">).children.filter(
    child => child.visible !== false,
  ).length !== 0;
