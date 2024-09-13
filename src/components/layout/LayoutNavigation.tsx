import dynamic from "next/dynamic";

import { useScreenSizes } from "~/hooks/use-screen-sizes";

const LayoutMenu = dynamic(() => import("./LayoutMenu"), { ssr: false });

export const LayoutNavigation = () => {
  const { isLessThanOrEqualTo } = useScreenSizes({});
};
