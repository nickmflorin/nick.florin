"use client";
import { forwardRef } from "react";

import clsx from "clsx";

import type * as types from "./types";

import { Tooltip } from "~/components/floating/Tooltip";
import { type ILayoutNavItem } from "~/components/layout/LayoutNav";
import { useNavigatable } from "~/hooks";

import { IconButton, type IconButtonProps } from "./generic";

export interface LayoutNavAnchorProps
  extends Omit<IconButtonProps<"link">, "options" | "isActive" | "icon" | "href"> {
  readonly item: Pick<ILayoutNavItem, "active" | "icon" | "path" | "children" | "tooltipLabel">;
}

export const LayoutNavAnchor = forwardRef<
  types.PolymorphicButtonElement<"link">,
  LayoutNavAnchorProps
>(({ item, ...props }: LayoutNavAnchorProps, forwardedRef: types.PolymorphicButtonRef<"link">) => {
  const { isActive, href, isPending, setActiveOptimistically } = useNavigatable({ item });
  return (
    /* Using a Portal here prevents glitches associated with the tooltip from shifting around to
         incorrect locations when the position of the sidebar items change due to hovering of a
         parent sidebar item with children.  It also prevents a bug related to the opacity of the
         tooltip changing so that it looks semi-transparent - althought the reason a portal fixes
         that problem is less clear. */
    <Tooltip content={item.tooltipLabel} placement="right" variant="secondary" inPortal>
      {({ ref, params }) => (
        <IconButton<"link">
          {...props}
          {...params}
          isLoading={isPending}
          onClick={() => setActiveOptimistically()}
          className={clsx("z-0", props.className)}
          ref={instance => {
            ref(instance);
            if (typeof forwardedRef === "function") {
              forwardedRef(instance);
            } else if (forwardedRef) {
              forwardedRef.current = instance;
            }
          }}
          as="link"
          href={href}
          size="xlarge"
          iconSize="medium"
          icon={item.icon}
          isActive={isActive}
        />
      )}
    </Tooltip>
  );
});
