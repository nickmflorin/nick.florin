"use client";
import { forwardRef } from "react";

import type * as types from "./types";

import {
  sidebarItemIsExternal,
  type IExternalSidebarItem,
  type IInternalSidebarItem,
} from "~/components/layout";
import { classNames } from "~/components/types";
import { useNavMenu, useNavigationItem } from "~/hooks";

import { Button, type ButtonProps } from "./generic";

export type InternalNavMenuAnchorProps = Omit<
  ButtonProps<"link">,
  "options" | "isActive" | "icon" | "href" | "element"
> & {
  readonly item: Omit<IInternalSidebarItem, "children">;
};

export type ExternalNavMenuAnchorProps = Omit<
  ButtonProps<"a">,
  "options" | "isActive" | "icon" | "href" | "element"
> & {
  readonly item: IExternalSidebarItem;
};

export const InternalNavMenuAnchor = forwardRef<
  types.PolymorphicButtonElement<"link">,
  InternalNavMenuAnchorProps
>(({ item, ...props }: InternalNavMenuAnchorProps, ref: types.PolymorphicButtonRef<"link">) => {
  const { isActive, href, setNavigating } = useNavigationItem(item);
  const { close } = useNavMenu();
  return (
    <Button.Solid<"link">
      {...props}
      element="link"
      activeClassName="bg-blue-800 outline-blue-800 text-white"
      onClick={() => {
        setNavigating();
        close();
      }}
      className={classNames(
        "z-0 text-body outline-gray-50 bg-gray-50 w-full h-full",
        { ["hover:bg-gray-300 hover:outline-gray-300"]: !isActive },
        props.className,
      )}
      ref={ref}
      href={href}
      size="medium"
      iconSize="medium"
      fontSize="sm"
      icon={item.icon}
      isActive={isActive}
    >
      {item.label}
    </Button.Solid>
  );
});

export const ExternalNavMenuAnchor = forwardRef<
  types.PolymorphicButtonElement<"a">,
  ExternalNavMenuAnchorProps
>(({ item, ...props }: ExternalNavMenuAnchorProps, ref: types.PolymorphicButtonRef<"link">) => (
  <Button.Solid<"a">
    {...props}
    className={classNames(
      "z-0 text-body outline-gray-50 bg-gray-50 w-full h-full",
      "hover:bg-gray-300 hover:outline-gray-300",
      props.className,
    )}
    ref={ref}
    element="a"
    href={item.href}
    size="medium"
    iconSize="medium"
    fontSize="sm"
    icon={item.icon}
    openInNewTab
  >
    {item.label}
  </Button.Solid>
));

export type NavMenuAnchorProps<
  I extends Omit<IInternalSidebarItem, "children"> | IExternalSidebarItem =
    | Omit<IInternalSidebarItem, "children">
    | IExternalSidebarItem,
> = Omit<ButtonProps<"link" | "a">, "options" | "isActive" | "icon" | "href"> & {
  readonly item: I;
};

export const NavMenuAnchor = forwardRef<
  types.PolymorphicButtonElement<"a"> | types.PolymorphicButtonElement<"link">,
  NavMenuAnchorProps
>(
  <I extends Omit<IInternalSidebarItem, "children"> | IExternalSidebarItem>(
    { item, ...props }: NavMenuAnchorProps<I>,
    ref: types.PolymorphicButtonRef<"link"> | types.PolymorphicButtonRef<"a">,
  ) => {
    if (sidebarItemIsExternal(item)) {
      return (
        <ExternalNavMenuAnchor {...(props as ExternalNavMenuAnchorProps)} item={item} ref={ref} />
      );
    }
    return (
      <InternalNavMenuAnchor {...(props as InternalNavMenuAnchorProps)} item={item} ref={ref} />
    );
  },
);
