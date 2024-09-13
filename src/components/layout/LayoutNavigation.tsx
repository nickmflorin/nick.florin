"use client";
import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";
import { type ISidebarItem } from "~/components/layout/types";
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
  if (isLessThanOrEqualTo("450px")) {
    return (
      <LayoutMenuWrapper>
        <LayoutMenu nav={nav} />
      </LayoutMenuWrapper>
    );
  }
  return <Sidebar items={nav} />;
};
