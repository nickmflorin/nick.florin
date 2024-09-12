"use client";
import { forwardRef } from "react";

import type * as types from "./types";

import { Tooltip } from "~/components/floating/Tooltip";
import {
  layoutNavItemIsExternal,
  type IExternalLayoutNavItem,
  type IInternalLayoutNavItem,
} from "~/components/layout";
import { classNames } from "~/components/types";
import { useNavigatable } from "~/hooks";

import { IconButton, type IconButtonProps } from "./generic";

export type InternalLayoutNavAnchorProps = Omit<
  IconButtonProps<"link">,
  "options" | "isActive" | "icon" | "href" | "element"
> & {
  readonly item: Omit<IInternalLayoutNavItem, "children">;
};

export type ExternalLayoutNavAnchorProps = Omit<
  IconButtonProps<"a">,
  "options" | "isActive" | "icon" | "href" | "element"
> & {
  readonly item: IExternalLayoutNavItem;
};

export const InternalLayoutNavAnchor = forwardRef<
  types.PolymorphicButtonElement<"link">,
  InternalLayoutNavAnchorProps
>(({ item, ...props }: InternalLayoutNavAnchorProps, ref: types.PolymorphicButtonRef<"link">) => {
  const { isActive, href, isPending, setActiveOptimistically } = useNavigatable({
    id: item.path,
    item,
  });
  return (
    <IconButton.Solid<"link">
      {...props}
      element="link"
      activeClassName="bg-blue-800 outline-blue-800 text-white"
      isLoading={isPending}
      onClick={() => setActiveOptimistically()}
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

export const ExternalLayoutNavAnchor = forwardRef<
  types.PolymorphicButtonElement<"a">,
  ExternalLayoutNavAnchorProps
>(({ item, ...props }: ExternalLayoutNavAnchorProps, ref: types.PolymorphicButtonRef<"link">) => (
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
    target="_blank"
    rel="noopener noreferrer"
  />
));

export type LayoutNavAnchorProps<
  I extends Omit<IInternalLayoutNavItem, "children"> | IExternalLayoutNavItem =
    | Omit<IInternalLayoutNavItem, "children">
    | IExternalLayoutNavItem,
> = Omit<IconButtonProps<"link" | "a">, "options" | "isActive" | "icon" | "href"> & {
  readonly item: I;
};

export const LayoutNavAnchor = forwardRef<
  types.PolymorphicButtonElement<"a"> | types.PolymorphicButtonElement<"link">,
  LayoutNavAnchorProps
>(
  <I extends Omit<IInternalLayoutNavItem, "children"> | IExternalLayoutNavItem>(
    { item, ...props }: LayoutNavAnchorProps<I>,
    forwardedRef: types.PolymorphicButtonRef<"link"> | types.PolymorphicButtonRef<"a">,
  ) => (
    /* Using a Portal here prevents glitches associated with the tooltip from shifting around to
       incorrect locations when the position of the sidebar items change due to hovering of a
       parent sidebar item with children.  It also prevents a bug related to the opacity of the
       tooltip changing so that it looks semi-transparent - althought the reason a portal fixes
       that problem is less clear. */
    <Tooltip content={item.tooltipLabel} placement="right" variant="secondary" inPortal>
      {({ ref, params }) => {
        if (layoutNavItemIsExternal(item)) {
          return (
            <ExternalLayoutNavAnchor
              {...(props as ExternalLayoutNavAnchorProps)}
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
          <InternalLayoutNavAnchor
            {...(props as InternalLayoutNavAnchorProps)}
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
