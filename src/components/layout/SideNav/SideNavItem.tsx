"use client";
import { Suspense } from "react";

import { Button } from "~/components/buttons/generic";

import { type NavButtonItem } from "../nav";
import { Navigatable } from "../nav/Navigatable";

export interface SideNavItemProps {
  readonly item: NavButtonItem;
}

export const SideNavItem = ({
  item: { button = "primary", icon, label, ...item },
}: SideNavItemProps) => (
  /* Wrapped in a Suspense because useSearchParams() causes client-side rendering up to the
     closest Suspense boundary during static rendering. */
  <Suspense>
    <Navigatable item={item}>
      {({ isActive, href }) => (
        <Button
          variant={button}
          options={{ as: "link" }}
          icon={icon}
          href={href}
          isActive={isActive}
        >
          {label}
        </Button>
      )}
    </Navigatable>
  </Suspense>
);

export default SideNavItem;
