"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { type ISidebarItem, sidebarItemIsActive } from "~/components/layout";

import { IconButton, type IconButtonProps } from "./IconButton";

export interface SidebarAnchorProps
  extends Omit<IconButtonProps<{ as: "link" }>, "options" | "isActive" | "icon"> {
  readonly item: Pick<ISidebarItem, "icon" | "queryParam" | "path" | "children">;
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
      to={{
        pathname: item.path,
        query: item.queryParam ? { [item.queryParam.key]: item.queryParam.value } : undefined,
      }}
      size="xlarge"
      icon={item.icon}
      isActive={isActive}
    />
  );
};
