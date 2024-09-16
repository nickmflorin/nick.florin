"use client";
import dynamic from "next/dynamic";

import { MobileNavigationCutoff } from "~/components/constants";
import { type ISidebarItem } from "~/components/layout/types";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const SiteNavMenuWrapper = dynamic(
  () => import("~/features/site/components/SiteNavMenuWrapper").then(mod => mod.SiteNavMenuWrapper),
  { ssr: false },
);

const Sidebar = dynamic(() => import("./Sidebar").then(mod => mod.Sidebar));

export interface LayoutNavigationProps {
  readonly children: JSX.Element;
  readonly nav: ISidebarItem[];
}

export const LayoutNavigation = ({ children, nav }: LayoutNavigationProps) => {
  const { isLessThanOrEqualTo } = useScreenSizes();
  if (isLessThanOrEqualTo(MobileNavigationCutoff)) {
    return <SiteNavMenuWrapper>{children}</SiteNavMenuWrapper>;
  }
  return <Sidebar items={nav} />;
};
