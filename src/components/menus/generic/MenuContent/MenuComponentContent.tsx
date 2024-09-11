import React, { cloneElement, useCallback } from "react";

import { isFragment } from "react-is";

import type * as types from "../../types";

import { classNames } from "~/components/types";

import { type MenuItemProps } from "../MenuItem";

const isMenuItem = (child: JSX.Element): boolean =>
  typeof child.type !== "string" && child.type && child.type.name === "MenuItem";

const isMenuItemGroup = (child: JSX.Element): boolean =>
  typeof child.type !== "string" &&
  child.type &&
  typeof child.type.name === "string" &&
  /* Checking if the component name ends with MenuItemGroup is a littl e bit hacky - we should
 investigate a better way of doing this. */
  (child.type.name === "MenuItemGroup" || child.type.name.endsWith("MenuItemGroup"));

export const MenuComponentContent = ({
  className,
  style,
  isBordered,
  isLocked,
  children,
  itemDisabledClassName,
  itemClassName,
  itemLoadingClassName,
  itemLockedClassName,
  itemSelectedClassName,
  itemHeight,
  selectionIndicator,
  iconSize,
  iconClassName,
  spinnerClassName,
}: types.MenuComponentContentProps): JSX.Element => {
  const modifyChild = useCallback(
    (child: JSX.Element) => {
      if (isMenuItem(child)) {
        const ch = child as React.ReactElement<MenuItemProps>;
        const newProps: MenuItemProps = {
          ...ch.props,
          isLocked: Boolean(isLocked || ch.props.isLocked),
          height: ch.props.height ?? itemHeight,
          selectedClassName: classNames(ch.props.selectedClassName, itemSelectedClassName),
          lockedClassName: classNames(ch.props.lockedClassName, itemLockedClassName),
          disabledClassName: classNames(ch.props.disabledClassName, itemDisabledClassName),
          loadingClassName: classNames(ch.props.loadingClassName, itemLoadingClassName),
          className: classNames(ch.props.className, itemClassName),
        };
        return cloneElement(child, newProps);
      } else if (isMenuItemGroup(child)) {
        const ch = child as React.ReactElement<types.MenuItemGroupComponentProps>;
        const newProps: types.MenuItemGroupComponentProps = {
          ...ch.props,
          itemHeight: ch.props.itemHeight ?? itemHeight,
          itemClassName: classNames(ch.props.itemClassName, itemClassName),
          itemDisabledClassName: classNames(ch.props.itemDisabledClassName, itemDisabledClassName),
          itemSelectedClassName: classNames(ch.props.itemSelectedClassName, itemSelectedClassName),
          itemLockedClassName: classNames(ch.props.itemLockedClassName, itemLockedClassName),
          itemLoadingClassName: classNames(ch.props.itemLoadingClassName, itemLoadingClassName),
          selectionIndicator: ch.props.selectionIndicator ?? selectionIndicator,
          iconSize: ch.props.iconSize ?? iconSize,
          iconClassName: classNames(ch.props.iconClassName, iconClassName),
          spinnerClassName: classNames(ch.props.spinnerClassName, spinnerClassName),
        };
        return cloneElement(child, newProps);
      }
      return child;
    },
    [
      itemDisabledClassName,
      itemClassName,
      itemLoadingClassName,
      itemLockedClassName,
      itemSelectedClassName,
      itemHeight,
      selectionIndicator,
      iconSize,
      iconClassName,
      spinnerClassName,
      isLocked,
    ],
  );

  return (
    <div
      style={style}
      className={classNames("menu__content", { "menu__content--bordered": isBordered }, className)}
    >
      {children
        .flatMap(ch => (Array.isArray(ch) ? ch : [ch]))
        .filter((ch): ch is JSX.Element => !isFragment(ch) && ch !== null)
        .map((child, i) => (
          <React.Fragment key={i}>{modifyChild(child)}</React.Fragment>
        ))}
    </div>
  );
};

export default MenuComponentContent;
