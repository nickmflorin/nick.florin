"use client";
import { Button } from "~/components/buttons/generic";

import { type NavButtonItem } from "../nav";
import { Navigatable } from "../nav/Navigatable";

export interface SideNavItemProps {
  readonly item: NavButtonItem;
}

export const SideNavItem = ({
  item: { button = "primary", icon, label, ...item },
}: SideNavItemProps) => (
  <Navigatable item={item}>
    {({ isActive, href }) => (
      <Button variant={button} options={{ as: "link" }} icon={icon} href={href} isActive={isActive}>
        {label}
      </Button>
    )}
  </Navigatable>
);

export default SideNavItem;
