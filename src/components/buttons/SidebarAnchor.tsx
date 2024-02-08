"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { forwardRef, useMemo } from "react";

import clsx from "clsx";

import type * as types from "./types";

import { Tooltip } from "~/components/floating/Tooltip";
import { type ISidebarItem, sidebarItemIsActive } from "~/components/layout";

import { IconButton, type IconButtonProps } from "./generic";

export interface SidebarAnchorProps
  extends Omit<IconButtonProps<{ as: "link" }>, "options" | "isActive" | "icon" | "href"> {
  readonly item: Pick<ISidebarItem, "active" | "icon" | "path" | "children" | "tooltipLabel">;
}

export const SidebarAnchor = forwardRef<
  types.PolymorphicButtonElement<{ as: "link" }>,
  SidebarAnchorProps
>(
  (
    { item, ...props }: SidebarAnchorProps,
    forwardedRef: types.PolymorphicButtonRef<{ as: "link" }>,
  ) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = useMemo(
      () => sidebarItemIsActive(item, { searchParams, pathname }),
      [pathname, item, searchParams],
    );

    return (
      <Tooltip content={item.tooltipLabel} placement="right">
        {({ ref, params }) => (
          <IconButton<{ as: "link" }>
            {...props}
            {...params}
            className={clsx("z-0", props.className)}
            ref={instance => {
              ref(instance);
              if (typeof forwardedRef === "function") {
                forwardedRef(instance);
              } else if (forwardedRef) {
                forwardedRef.current = instance;
              }
            }}
            options={{ as: "link" }}
            href={
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
            iconSize="medium"
            icon={item.icon}
            isActive={isActive}
          />
        )}
      </Tooltip>
    );
  },
);
