import { type ReadonlyURLSearchParams } from "next/navigation";

import { type Required } from "utility-types";

import { type PathActive, pathIsActive } from "~/lib/paths";
import { type IconProp } from "~/components/icons";

export interface ISidebarItem {
  readonly icon: IconProp;
  readonly label: string;
  readonly path: `/${string}`;
  readonly active: PathActive;
  readonly queryParam?: { key: string; value: string };
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
  {
    path,
    active,
    queryParam,
    children,
  }: Pick<ISidebarItem, "active" | "path" | "queryParam" | "children">,
  { pathname, searchParams }: { pathname: string; searchParams: ReadonlyURLSearchParams },
): boolean => {
  if (children === undefined || children.length === 0) {
    const pathActive = pathIsActive(active, pathname);
    if (pathActive) {
      if (queryParam === undefined) {
        return true;
      }
      return (
        searchParams.has(queryParam.key) &&
        searchParams.get(queryParam.key)?.trim() === queryParam.value
      );
    }
    return false;
  }
  const baseIsActive = sidebarItemIsActive(
    { path, active, queryParam },
    { pathname, searchParams },
  );
  return (
    baseIsActive || children.some(child => sidebarItemIsActive(child, { pathname, searchParams }))
  );
};
