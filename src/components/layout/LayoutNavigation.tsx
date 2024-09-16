"use client";
import dynamic from "next/dynamic";

import { MobileNavigationCutoff } from "~/components/constants";
import { type ISidebarItem } from "~/components/layout/types";
import { Loading } from "~/components/loading/Loading";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const LayoutMenuWrapper = dynamic(
  () => import("./LayoutMenuWrapper").then(mod => mod.LayoutMenuWrapper),
  { ssr: false },
);

const Sidebar = dynamic(() => import("./Sidebar").then(mod => mod.Sidebar));

const LayoutMenu = dynamic(() => import("./LayoutMenu").then(mod => mod.LayoutMenu), {
  ssr: false,
  loading: () => <Loading isLoading />,
});

export interface LayoutNavigationProps {
  readonly nav: ISidebarItem[];
}

export const LayoutNavigation = ({ nav }: LayoutNavigationProps) => {
  const { isLessThanOrEqualTo } = useScreenSizes();
  if (isLessThanOrEqualTo(MobileNavigationCutoff)) {
    return (
      <LayoutMenuWrapper>
        <LayoutMenu nav={nav} />
      </LayoutMenuWrapper>
    );
  }
  return <Sidebar items={nav} />;
};
