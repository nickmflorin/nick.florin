import { type ReadonlyURLSearchParams } from "next/navigation";

import { type Required } from "utility-types";

import { type PathActive, pathIsActive } from "~/lib/paths";
import { type Path } from "~/lib/urls";
import { type IconProp } from "~/components/icons";

export interface ISidebarItem {
  readonly icon: IconProp;
  readonly label: string;
  readonly path: Path | { pathname: Path; maintainQuery: true };
  readonly active: PathActive;
  readonly children?: [Omit<ISidebarItem, "children">, ...Omit<ISidebarItem, "children">[]];
}

export type SidebarItemHasChildren<I extends ISidebarItem | Required<ISidebarItem, "children">> =
  I extends { children: [Omit<ISidebarItem, "children">, ...Omit<ISidebarItem, "children">[]] }
    ? true
    : false;

export type IfSidebarItemHasChildren<
  T,
  I extends ISidebarItem | Required<ISidebarItem, "children">,
  R = never,
> = SidebarItemHasChildren<I> extends true ? T : R;

export const sidebarItemHasChildren = (
  item: ISidebarItem | Required<ISidebarItem, "children">,
): item is Required<ISidebarItem, "children"> =>
  (item as Required<ISidebarItem, "children">).children !== undefined &&
  (item as Required<ISidebarItem, "children">).children.length !== 0;

export const sidebarItemIsActive = (
  { path, active, children }: Pick<ISidebarItem, "active" | "path" | "children">,
  { pathname, searchParams }: { pathname: string; searchParams: ReadonlyURLSearchParams },
): boolean => {
  if (children === undefined || children.length === 0) {
    return pathIsActive(active, pathname);
  }
  const baseIsActive = sidebarItemIsActive({ path, active }, { pathname, searchParams });
  return (
    baseIsActive || children.some(child => sidebarItemIsActive(child, { pathname, searchParams }))
  );
};
