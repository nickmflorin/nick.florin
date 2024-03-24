"use client";
import { useDrawers } from "~/components/drawers/hooks";

export const LayoutDrawer = () => {
  const { drawer } = useDrawers();
  return <>{drawer}</>;
};

export default LayoutDrawer;
