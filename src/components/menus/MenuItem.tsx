"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useMemo } from "react";
import { type ReactNode, useImperativeHandle, forwardRef } from "react";

import { isFragment } from "react-is";

import { type SpinnerProps, type IconProp, type IconName, isIconProp } from "~/components/icons";
import { LoadingText } from "~/components/loading/LoadingText";
import * as types from "~/components/menus";
import { type Action } from "~/components/structural/Actions";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import {
  sizeToString,
  inferQuantitativeSizeValue,
  type QuantitativeSize,
} from "~/components/types/sizes";
import { Description } from "~/components/typography";
import { ShowHide, Square } from "~/components/util";

import { MenuItemCheckbox } from "./MenuItemCheckbox";
import { MenuItemIcon } from "./MenuItemIcon";
import { MenuItemSpinner } from "./MenuItemSpinner";

const Actions = dynamic(() => import("~/components/structural/Actions").then(mod => mod.Actions));

type MenuItemRenderCallback<V> = V | ((params: types.MenuItemRenderProps) => V);

export interface MenuItemProps
  extends ComponentProps,
    Omit<React.ComponentProps<"div">, "children" | "onClick" | "ref" | keyof ComponentProps> {
  readonly icon?: MenuItemRenderCallback<IconProp | IconName | JSX.Element | undefined>;
  readonly description?: MenuItemRenderCallback<ReactNode>;
  readonly iconClassName?: ComponentProps["className"];
  readonly iconProps?: types.MenuItemIconProps;
  readonly spinnerProps?: Omit<SpinnerProps, "size" | "className" | "isLoading">;
  readonly iconSize?: QuantitativeSize<"px">;
  readonly spinnerClassName?: ComponentProps["className"];
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isSelected?: boolean;
  readonly isDisabled?: boolean;
  readonly isCurrentNavigation?: boolean;
  readonly highlightOnHover?: boolean;
  readonly isVisible?: boolean;
  readonly loadingText?: string;
  readonly actions?: Action[];
  readonly height?: QuantitativeSize<"px">;
  readonly includeDescription?: boolean;
  readonly contentClassName?: ComponentProps["className"];
  readonly selectedClassName?: ComponentProps["className"];
  readonly navigatedClassName?: ComponentProps["className"];
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
  readonly children: ReactNode | ((params: types.MenuItemRenderProps) => ReactNode);
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: types.MenuItemInstance,
  ) => void;
}

interface MenuItemLeftAffixProps
  extends Pick<
    MenuItemProps,
    | "icon"
    | "iconProps"
    | "iconSize"
    | "iconClassName"
    | "spinnerClassName"
    | "spinnerProps"
    | "selectionIndicator"
    | "isSelected"
    | "icon"
    | "iconProps"
    | "iconSize"
    | "iconClassName"
    | "spinnerClassName"
    | "spinnerProps"
    | "actions"
    | "loadingText"
    | "selectionIndicator"
    | "isLoading"
    | "isDisabled"
    | "isLocked"
  > {}

const MenuItemLeftAffix = ({
  isLocked = false,
  isLoading = false,
  isDisabled = false,
  icon: _icon,
  selectionIndicator,
  isSelected,
  ...rest
}: MenuItemLeftAffixProps) => {
  const icon = typeof _icon === "function" ? _icon({ isLocked, isLoading, isDisabled }) : _icon;
  if (!types.menuItemHasSelectionIndicator(selectionIndicator, "checkbox")) {
    if (icon !== undefined) {
      if (typeof icon === "string" || isIconProp(icon)) {
        return <MenuItemIcon {...rest} icon={icon} isLoading={isLoading} />;
      }
      return <Square>{isLoading ? <MenuItemSpinner {...rest} /> : icon}</Square>;
    } else if (isLoading) {
      return <MenuItemSpinner {...rest} />;
    }
    return <></>;
  } else if (icon !== undefined) {
    if (typeof icon === "string" || isIconProp(icon)) {
      return (
        <>
          <MenuItemCheckbox
            {...rest}
            isSelected={isSelected}
            isDisabled={isDisabled}
            isLocked={isLocked}
            isLoading={isLoading}
          />
          {/* The loading indicator should appear over the checkbox, not the icon - so do not
              include the 'isLoading' flag. */}
          <MenuItemIcon {...rest} icon={icon} />
        </>
      );
    }
    return (
      <>
        <MenuItemCheckbox
          {...rest}
          isSelected={isSelected}
          isDisabled={isDisabled}
          isLocked={isLocked}
          isLoading={isLoading}
        />
        {icon}
      </>
    );
  }
  return (
    <MenuItemCheckbox
      {...rest}
      isSelected={isSelected}
      isDisabled={isDisabled}
      isLocked={isLocked}
      isLoading={isLoading}
    />
  );
};

interface MenuItemContentProps
  extends Pick<
      MenuItemProps,
      | "description"
      | "contentClassName"
      | "isSelected"
      | "selectionIndicator"
      | "includeDescription"
    >,
    MenuItemLeftAffixProps {
  readonly children: ReactNode | ((params: types.MenuItemRenderProps) => ReactNode);
}

const MenuItemContent = ({
  contentClassName,
  description: _description,
  includeDescription = true,
  children,
  ...rest
}: MenuItemContentProps) => {
  const description = useMemo(
    () =>
      typeof _description === "function"
        ? _description({
            isLocked: rest.isLocked ?? false,
            isLoading: rest.isLoading ?? false,
            isDisabled: rest.isDisabled ?? false,
          })
        : _description,
    [_description, rest.isLocked, rest.isLoading, rest.isDisabled],
  );

  if (description && includeDescription) {
    return (
      <div className={classNames("menu__item__content-wrapper", contentClassName)}>
        <MenuItemContent {...rest}>{children}</MenuItemContent>
        <Description component="div" className="menu__item__description">
          {description}
        </Description>
      </div>
    );
  }
  return (
    <div className={classNames("menu__item__content", contentClassName)}>
      <MenuItemLeftAffix {...rest} />
      {children !== null && children !== undefined && !isFragment(children) && (
        <div className="menu__item__inner-content">
          {rest.isLoading && rest.loadingText ? (
            <LoadingText>{rest.loadingText}</LoadingText>
          ) : typeof children === "function" ? (
            children({
              isLocked: rest.isLocked ?? false,
              isLoading: rest.isLoading ?? false,
              isDisabled: rest.isDisabled ?? false,
            })
          ) : (
            children
          )}
        </div>
      )}
      <Actions actions={rest.actions ?? []} />
    </div>
  );
};

export const MenuItem = forwardRef<types.MenuItemInstance, MenuItemProps>(
  (
    {
      height,
      actions = [],
      isSelected = false,
      selectedClassName,
      loadingClassName,
      lockedClassName,
      disabledClassName,
      spinnerClassName,
      spinnerProps,
      contentClassName,
      children,
      isVisible = true,
      isCurrentNavigation = false,
      description,
      includeDescription,
      icon,
      iconClassName,
      navigatedClassName,
      iconSize,
      iconProps,
      isLoading: propIsLoading,
      isLocked: propIsLocked,
      isDisabled: propIsDisabled,
      selectionIndicator,
      loadingText,
      highlightOnHover = true,
      ...props
    }: MenuItemProps,
    ref,
  ): JSX.Element => {
    const localRef = useRef<HTMLDivElement | null>(null);

    const [_isLoading, setLoading] = useState(false);
    const [_isDisabled, setDisabled] = useState(false);
    const [_isLocked, setLocked] = useState(false);

    const isLocked = propIsLocked || _isLocked;
    const isLoading = propIsLoading || _isLoading;
    const isDisabled = propIsDisabled || _isDisabled;

    useImperativeHandle(ref, () => ({
      setLoading,
      setDisabled,
      setLocked,
    }));

    return (
      <ShowHide show={isVisible}>
        <div
          {...props}
          ref={localRef}
          /* This is not an ideal/great solution, but short of a stop-gap hack.  The problem is that
             when we have a drawer that has Select's that render their popover's in a portal, the
             mouse down and touch start events on the menu items in the popover's portal cause the
             drawer to close (due to the 'useClickOutside' hook from "@mantine/hooks" which is
             applied to the drawer).  To prevent this, we simply stop the propogation of those
             events so the drawer does not close. */
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            if (!isDisabled && !isLocked && !isLoading) {
              props.onClick?.(e, {
                ...(localRef.current as HTMLDivElement),
                setLoading,
                setDisabled,
                setLocked,
              });
            }
          }}
          className={classNames(
            "menu__item",
            { "menu__item--highlight-on-hover": highlightOnHover },
            { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
            {
              "menu__item--selected":
                isSelected && types.menuItemHasSelectionIndicator(selectionIndicator, "highlight"),
              [classNames("menu__item--navigated", navigatedClassName)]: isCurrentNavigation,
              [classNames(selectedClassName)]: isSelected,
              [classNames("menu__item--loading", loadingClassName)]: isLoading,
              [classNames("disabled", disabledClassName)]: isDisabled,
              [classNames("menu__item--locked", lockedClassName)]: isLocked,
            },
            props.className,
          )}
          style={
            height !== undefined
              ? {
                  ...props.style,
                  height: sizeToString(height, "px"),
                  lineHeight: `${inferQuantitativeSizeValue(height) - 2 * 6}px`,
                }
              : props.style
          }
        >
          <MenuItemContent
            actions={actions}
            spinnerClassName={spinnerClassName}
            spinnerProps={spinnerProps}
            icon={icon}
            description={description}
            includeDescription={includeDescription}
            iconClassName={iconClassName}
            iconProps={iconProps}
            iconSize={iconSize}
            contentClassName={contentClassName}
            isLoading={isLoading}
            isDisabled={isDisabled}
            isLocked={isLocked}
            selectionIndicator={selectionIndicator}
            isSelected={isSelected}
            loadingText={loadingText}
          >
            {children}
          </MenuItemContent>
        </div>
      </ShowHide>
    );
  },
);
