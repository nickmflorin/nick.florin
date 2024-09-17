"use client";
import dynamic from "next/dynamic";

import { useScreenSizes } from "~/hooks/use-screen-sizes";

import { type SkillsFilterPopoverProps } from "./SkillsFilterPopover";

const SkillsFilterPopover = dynamic(
  () => import("./SkillsFilterPopover").then(mod => mod.SkillsFilterPopover),
  { ssr: false },
);

export interface SkillsFilterDropdownMenuProps extends SkillsFilterPopoverProps {}

export const SkillsFilterDropdownMenu = (props: SkillsFilterDropdownMenuProps): JSX.Element => {
  const { isLessThan } = useScreenSizes();

  /* We do not want to show the chart filters on mobile devices until we figure out how to more
     cleanly integrate them into the mobile experience with a drawer instead of a popover. */
  if (isLessThan("md")) {
    return <></>;
  }
  return <SkillsFilterPopover {...props} />;
};

export default SkillsFilterDropdownMenu;
