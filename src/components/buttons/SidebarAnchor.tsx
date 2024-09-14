"use client";
import { forwardRef } from "react";

import type * as types from "./types";

import { Tooltip } from "~/components/floating/Tooltip";
import {
  sidebarItemIsExternal,
  type IExternalSidebarItem,
  type IInternalSidebarItem,
} from "~/components/layout";
import { classNames } from "~/components/types";
import { useNavigationItem } from "~/hooks";

import { IconButton, type IconButtonProps } from "./generic";

export type InternalSidebarAnchorProps = Omit<
  IconButtonProps<"link">,
  "options" | "isActive" | "icon" | "href" | "element"
> & {
  readonly item: Omit<IInternalSidebarItem, "children">;
};

export type ExternalSidebarAnchorProps = Omit<
  IconButtonProps<"a">,
  "options" | "isActive" | "icon" | "href" | "element"
> & {
  readonly item: IExternalSidebarItem;
};

export const InternalSidebarAnchor = forwardRef<
  types.PolymorphicButtonElement<"link">,
  InternalSidebarAnchorProps
>(({ item, ...props }: InternalSidebarAnchorProps, ref: types.PolymorphicButtonRef<"link">) => {
  const { isActive, href, isPending, setNavigating } = useNavigationItem(item);
  return (
    <IconButton.Solid<"link">
      {...props}
      element="link"
      activeClassName="bg-blue-800 outline-blue-800 text-white"
      isLoading={isPending}
      onClick={() => setNavigating()}
      className={classNames(
        "z-0 text-body outline-transparent bg-transparent w-full h-full",
        { ["hover:bg-gray-300 hover:outline-gray-300"]: !isActive },
        props.className,
      )}
      ref={ref}
      href={href}
      size="xlarge"
      iconSize="medium"
      icon={item.icon}
      isActive={isActive}
    />
  );
});

export const ExternalSidebarAnchor = forwardRef<
  types.PolymorphicButtonElement<"a">,
  ExternalSidebarAnchorProps
>(({ item, ...props }: ExternalSidebarAnchorProps, ref: types.PolymorphicButtonRef<"link">) => (
  <IconButton.Solid<"a">
    {...props}
    className={classNames(
      "z-0 text-body outline-transparent bg-transparent w-full h-full",
      "hover:bg-gray-300 hover:outline-gray-300",
      props.className,
    )}
    ref={ref}
    element="a"
    href={item.href}
    size="xlarge"
    iconSize="medium"
    icon={item.icon}
    openInNewTab
  />
));

export type SidebarAnchorProps<
  I extends Omit<IInternalSidebarItem, "children"> | IExternalSidebarItem =
    | Omit<IInternalSidebarItem, "children">
    | IExternalSidebarItem,
> = Omit<IconButtonProps<"link" | "a">, "options" | "isActive" | "icon" | "href"> & {
  readonly item: I;
};

export const SidebarAnchor = forwardRef<
  types.PolymorphicButtonElement<"a"> | types.PolymorphicButtonElement<"link">,
  SidebarAnchorProps
>(
  <I extends Omit<IInternalSidebarItem, "children"> | IExternalSidebarItem>(
    { item, ...props }: SidebarAnchorProps<I>,
    forwardedRef: types.PolymorphicButtonRef<"link"> | types.PolymorphicButtonRef<"a">,
  ) => (
    /* Using a Portal here prevents glitches associated with the tooltip from shifting around to
       incorrect locations when the position of the sidebar items change due to hovering of a
       parent sidebar item with children.  It also prevents a bug related to the opacity of the
       tooltip changing so that it looks semi-transparent - althought the reason a portal fixes
       that problem is less clear. */
    <Tooltip content={item.label} placement="right" variant="secondary" inPortal>
      {({ ref, params }) => {
        if (sidebarItemIsExternal(item)) {
          return (
            <ExternalSidebarAnchor
              {...(props as ExternalSidebarAnchorProps)}
              {...params}
              item={item}
              ref={instance => {
                ref(instance);
                if (typeof forwardedRef === "function") {
                  forwardedRef(instance);
                } else if (forwardedRef) {
                  forwardedRef.current = instance;
                }
              }}
            />
          );
        }
        return (
          <InternalSidebarAnchor
            {...(props as InternalSidebarAnchorProps)}
            {...params}
            item={item}
            ref={instance => {
              ref(instance);
              if (typeof forwardedRef === "function") {
                forwardedRef(instance);
              } else if (forwardedRef) {
                forwardedRef.current = instance;
              }
            }}
          />
        );
      }}
    </Tooltip>
  ),
);
