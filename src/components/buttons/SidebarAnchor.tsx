"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { type ISidebarItem, sidebarItemIsActive } from "~/components/layout";

import { IconButton, type IconButtonProps } from "./IconButton";

export interface SidebarAnchorProps
  extends Omit<IconButtonProps<{ as: "link" }>, "options" | "isActive" | "icon"> {
  readonly item: Pick<ISidebarItem, "active" | "icon" | "path" | "children">;
}

export const SidebarAnchor = ({ item, ...props }: SidebarAnchorProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = useMemo(
    () => sidebarItemIsActive(item, { searchParams, pathname }),
    [pathname, item, searchParams],
  );

  return (
    <IconButton
      {...props}
      options={{ as: "link" }}
      to={
        typeof item.path === "string"
          ? {
              pathname: item.path,
            }
          : {
              pathname: item.path.pathname,
              query: searchParams.toString(),
            }
      }
      size="xlarge"
      icon={item.icon}
      isActive={isActive}
    />
  );
};
