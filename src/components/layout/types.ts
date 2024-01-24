import { type ReadonlyURLSearchParams } from "next/navigation";

import { type Required } from "utility-types";

import { type IconProp } from "~/components/icons";

export interface ISidebarItem {
  readonly icon: IconProp;
  readonly label: string;
  readonly path: `/${string}`;
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

export const SidebarItems: ISidebarItem[] = [
  {
    label: "Resume",
    icon: { name: "file-user" },
    path: "/resume",
    children: [
      {
        label: "Experience",
        icon: { name: "briefcase" },
        path: "/resume",
        queryParam: { key: "section", value: "experience" },
      },
      {
        label: "Education",
        icon: { name: "building-columns" },
        path: "/resume",
        queryParam: { key: "section", value: "education" },
      },
    ],
  },
  {
    label: "Projects",
    icon: { name: "file-user" },
    path: "/projects",
  },
];

export const sidebarItemIsActive = (
  { path, queryParam, children }: Pick<ISidebarItem, "path" | "queryParam" | "children">,
  { pathname, searchParams }: { pathname: string; searchParams: ReadonlyURLSearchParams },
): boolean => {
  if (children === undefined || children.length === 0) {
    if (path === pathname) {
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
  const baseIsActive = sidebarItemIsActive({ path, queryParam }, { pathname, searchParams });
  return (
    baseIsActive || children.some(child => sidebarItemIsActive(child, { pathname, searchParams }))
  );
};
