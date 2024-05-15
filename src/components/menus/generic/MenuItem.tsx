import dynamic from "next/dynamic";
import Link from "next/link";
import { type ReactNode } from "react";

import clsx from "clsx";

import type * as types from "../types";

import {
  type ComponentProps,
  type HTMLElementProps,
  withoutOverridingClassName,
  mergeIntoClassNames,
} from "~/components/types";
import { sizeToString, sizeToNumber, type QuantitativeSize } from "~/components/types/sizes";
import { ShowHide } from "~/components/util";

import { MenuItemIcon } from "./MenuItemIcon";

const Spinner = dynamic(() => import("~/components/icons/Spinner"));
const Checkbox = dynamic(() => import("~/components/input/Checkbox"));
const Actions = dynamic(() => import("~/components/structural/Actions"));

interface LocalMenuItemProps
  extends ComponentProps,
    HTMLElementProps<"div">,
    Pick<
      types.MenuModel,
      | "iconClassName"
      | "spinnerClassName"
      | "icon"
      | "iconSize"
      | "isDisabled"
      | "isLoading"
      | "isLocked"
      | "isVisible"
      | "actions"
    > {
  readonly height?: QuantitativeSize<"px">;
  readonly isSelected?: boolean;
  readonly contentClassName?: ComponentProps["className"];
  readonly selectedClassName?: ComponentProps["className"];
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly children: ReactNode;
  readonly isMulti?: boolean;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
}

const LocalMenuItem = ({
  height,
  actions,
  isSelected = false,
  isMulti = false,
  selectedClassName,
  loadingClassName,
  lockedClassName,
  disabledClassName,
  spinnerClassName,
  contentClassName,
  children,
  isDisabled = false,
  isLocked = false,
  isVisible = true,
  icon,
  iconClassName,
  iconSize = "16px",
  isLoading = false,
  selectionIndicator = "checkbox",
  ...props
}: LocalMenuItemProps): JSX.Element => (
  <ShowHide show={isVisible}>
    <div
      {...props}
      onClick={e => {
        if (!isDisabled && !isLocked && !isLoading) {
          props.onClick?.(e);
        }
      }}
      className={clsx(
        "menu__item",
        { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
        {
          [clsx("menu__item--selected", selectedClassName)]: isSelected,
          [clsx("menu__item--loading", loadingClassName)]: isLoading,
          [clsx("disabled", disabledClassName)]: isDisabled,
          [clsx("menu__item--locked", lockedClassName)]: isLocked,
        },
        mergeIntoClassNames(props.className, {
          [clsx(selectedClassName)]: isSelected,
          [clsx(loadingClassName)]: isLoading,
          [clsx(disabledClassName)]: isDisabled,
          [clsx(lockedClassName)]: isLocked,
        }),
      )}
      style={
        height !== undefined
          ? {
              ...props.style,
              height: sizeToString(height, "px"),
              lineHeight: `${sizeToNumber(height) - 2 * 6}px`,
            }
          : props.style
      }
    >
      <ShowHide show={isMulti && selectionIndicator === "checkbox"}>
        <Checkbox readOnly value={isSelected} isDisabled={isDisabled} isLocked={isLocked} />
      </ShowHide>
      <MenuItemIcon
        icon={icon}
        iconSize={iconSize}
        iconClassName={iconClassName}
        isLoading={isLoading}
        spinnerClassName={spinnerClassName}
      />
      <div className={clsx("menu__item__content", contentClassName)}>{children}</div>
      {/* Only show the spinner to the right (instead of over the icon) if the icon is not
          defined. */}
      {icon === undefined && (
        <Spinner
          className={clsx(
            withoutOverridingClassName(
              "text-gray-600",
              mergeIntoClassNames(iconClassName, spinnerClassName),
            ),
            mergeIntoClassNames(iconClassName, spinnerClassName),
          )}
          isLoading={isLoading}
          size="18px"
          dimension="height"
        />
      )}
      <Actions actions={actions ?? null} />
    </div>
  </ShowHide>
);

export interface MenuItemProps extends LocalMenuItemProps {
  readonly href?: string | { url: string; target?: string; rel?: string };
}

export const MenuItem = ({ href, ...props }: MenuItemProps): JSX.Element => {
  if (href) {
    if (typeof href === "string") {
      return (
        <Link href={href}>
          <LocalMenuItem {...props} />
        </Link>
      );
    }
    return (
      <Link href={href.url} rel={href.rel} target={href.target}>
        <LocalMenuItem {...props} />
      </Link>
    );
  }
  return <LocalMenuItem {...props} />;
};
