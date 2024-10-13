"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useMemo } from "react";
import { type ReactNode, useImperativeHandle, forwardRef } from "react";

import { type Required } from "utility-types";

import { type SpinnerProps, type IconProp, type IconName, isIconProp } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { Spinner } from "~/components/icons/Spinner";
import { Checkbox } from "~/components/input/Checkbox";
import { LoadingText } from "~/components/loading/LoadingText";
import * as types from "~/components/menus";
import { type Action } from "~/components/structural/Actions";
import { classNames } from "~/components/types";
import { type ComponentProps, parseDataAttributes } from "~/components/types";
import {
  sizeToString,
  inferQuantitativeSizeValue,
  type QuantitativeSize,
} from "~/components/types/sizes";
import { Description } from "~/components/typography";
import { ReplacedSubstrings } from "~/components/typography/ReplacedSubstrings";
import { Square } from "~/components/util";

const Actions = dynamic(() => import("~/components/structural/Actions").then(mod => mod.Actions));

type MenuItemSimpleRenderCallback<V> =
  | V
  | ((params: Omit<types.MenuItemRenderProps, `set${string}`>) => V);

type MenuItemRenderCallback<V> = V | ((params: types.MenuItemRenderProps) => V);

interface MenuItemCheckboxProps extends Omit<SpinnerProps, "size"> {
  readonly isSelected?: boolean;
  readonly isDisabled?: boolean;
  readonly isLocked?: boolean;
  readonly spinnerSize: QuantitativeSize<"px">;
  readonly checkboxSize: QuantitativeSize<"px">;
}

const MenuItemCheckbox = ({
  isLocked,
  isDisabled,
  isSelected,
  isLoading,
  checkboxSize = "16px",
  spinnerSize = "16px",
  ...props
}: MenuItemCheckboxProps) => (
  <Square
    contain
    size={sizeToString(
      Math.max(inferQuantitativeSizeValue(checkboxSize), inferQuantitativeSizeValue(spinnerSize)),
      "px",
    )}
  >
    {isLoading ? (
      <Spinner {...props} isLoading size={spinnerSize} />
    ) : (
      <Checkbox
        readOnly
        value={isSelected}
        isDisabled={isDisabled}
        isLocked={isLocked}
        size={checkboxSize}
      />
    )}
  </Square>
);

interface MenuItemLeftAffixProps {
  readonly icon?: MenuItemSimpleRenderCallback<IconProp | IconName | JSX.Element | undefined>;
  readonly iconClassName?: ComponentProps["className"];
  readonly iconSize?: QuantitativeSize<"px">;
  readonly checkboxSize?: QuantitativeSize<"px">;
  readonly spinnerSize?: QuantitativeSize<"px">;
  readonly spinnerClassName?: ComponentProps["className"];
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isSelected?: boolean;
  readonly isDisabled?: boolean;
  readonly selectionIndicator?: types.MenuItemSelectionIndicator;
}

type DefaultedBooleanMap<M extends { [key in string]?: boolean }, V extends boolean> = {
  [key in keyof Required<M>]: [M[key]] extends [boolean] ? M[key] : V;
};

const defaultBooleanMap = <V extends boolean, M extends { [key in string]?: boolean }>(
  map: M,
  value: V,
): DefaultedBooleanMap<M, V> => {
  let newMap = {} as DefaultedBooleanMap<M, V>;
  for (const _k of Object.keys(map)) {
    const k = _k as keyof M;
    if (map[k] === undefined) {
      newMap = { ...newMap, [k]: value };
    }
  }
  return newMap;
};

const MenuItemLeftAffix = ({
  icon: _icon,
  selectionIndicator,
  iconClassName,
  iconSize = "18px",
  spinnerClassName,
  checkboxSize = "16px",
  spinnerSize = "16px",
  ...stateFlags
}: MenuItemLeftAffixProps) => {
  const icon = typeof _icon === "function" ? _icon(defaultBooleanMap(stateFlags, false)) : _icon;
  /* If the MenuItem is not displaying a Checkbox, then we do not have to worry about showing a
     potential loading indicator in place of the Checkbox - instead, we can simply render the Icon
     component (if the 'icon' is provided as type IconProp or IconName) or the JSX.Element (if the
     'icon' is provided as a JSX.Element) directly.  If the MenuItem is in a loading state, a
     loading indicator will temporarily replace either the rendered Icon component or the rendered
     JSX.Element. */
  if (
    !types.menuItemHasSelectionIndicator(selectionIndicator, "checkbox") ||
    stateFlags.isSelected === undefined
  ) {
    if (icon !== undefined) {
      /* If the provided 'icon' is of type IconProp or IconName, we can render the Icon component
         directly, and provide the 'isLoading' prop which will cause a loading indicator to appear
         in place of the rendered <i> element when the 'isLoading' prop is true. */
      if (typeof icon === "string" || isIconProp(icon)) {
        return (
          <Icon
            isLoading={stateFlags.isLoading}
            icon={icon}
            size={iconSize}
            className={classNames("text-gray-600", iconClassName)}
            spinnerClassName={spinnerClassName}
            spinnerSize={spinnerSize}
          />
        );
      }
      /* If the provided 'icon' is a JSX.Element, we render the element defined by the 'icon' prop
         directly - and if the MenuItem is in a loading state, we replace the rendered element with
         a loading indicator. */
      return (
        /* Set the size of the containing square to be the size that the Spinner will render as.
           Then, setting the 'contain' flag will cause the children of the Square to not exceed
           the full height and/or width of the containing Square.  This is important to prevent
           text shifting from occurring when the MenuItem enters/exits the loading state, because
           the size of the JSX.Element provided via the 'icon' prop is both unknown and not capable
           of being directly manipulated (at least not easily). */
        <Square contain size={spinnerSize ?? iconSize}>
          {stateFlags.isLoading ? (
            <Spinner
              className={classNames("text-gray-600", iconClassName, spinnerClassName)}
              isLoading
              size={spinnerSize ?? iconSize}
            />
          ) : (
            icon
          )}
        </Square>
      );
    } else if (stateFlags.isLoading) {
      /* If no 'icon' is provided, and the MenuItem is not rendering a Checkbox, the only option
         left for placing a loading indicator is placing it to the left of the rest of the
         MenuItemContent.  This will cause the MenuItem's content to shift left/right when the
         MenuItem enters and exits a loading state - but it is the only other option. */
      return (
        <Spinner
          className={classNames("text-gray-600", iconClassName, spinnerClassName)}
          isLoading
          size={spinnerSize ?? iconSize}
        />
      );
    }
    return <></>;
  } else if (icon !== undefined) {
    /* If the MenuItem is rendering a Checkbox, we want the loading indicator to appear in place
       of the Checkbox, instead of being rendered in place of the rendered icon. */
    if (typeof icon === "string" || isIconProp(icon)) {
      return (
        <>
          <MenuItemCheckbox
            {...stateFlags}
            className={classNames("text-gray-600", iconClassName, spinnerClassName)}
            spinnerSize={spinnerSize ?? iconSize}
            checkboxSize={checkboxSize}
          />
          {/* The loading indicator should appear over the checkbox, not the icon - so do not
              include the 'isLoading' flag. */}
          <Icon
            icon={icon}
            size={iconSize}
            className={classNames("text-gray-600", iconClassName)}
          />
        </>
      );
    }
    return (
      <>
        <MenuItemCheckbox
          {...stateFlags}
          className={classNames("text-gray-600", iconClassName, spinnerClassName)}
          spinnerSize={spinnerSize ?? iconSize}
          checkboxSize={checkboxSize}
        />
        {icon}
      </>
    );
  }
  return (
    <MenuItemCheckbox
      {...stateFlags}
      className={classNames("text-gray-600", iconClassName, spinnerClassName)}
      spinnerSize={spinnerSize ?? iconSize}
      checkboxSize={checkboxSize}
    />
  );
};

interface MenuItemContentProps extends MenuItemLeftAffixProps {
  readonly boldSubstrings?: string;
  readonly includeDescription?: boolean;
  readonly loadingText?: string;
  readonly actions?: Action[];
  readonly contentClassName?: ComponentProps["className"];
  readonly description?: MenuItemSimpleRenderCallback<ReactNode>;
  readonly children: MenuItemSimpleRenderCallback<ReactNode>;
}

const MenuItemContent = ({
  contentClassName,
  description: _description,
  includeDescription = true,
  children: _children,
  loadingText,
  boldSubstrings,
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

  const children = useMemo(() => {
    let c: ReactNode;
    if (typeof _children === "function") {
      c = _children({
        isLocked: rest.isLocked ?? false,
        isLoading: rest.isLoading ?? false,
        isDisabled: rest.isDisabled ?? false,
      });
    } else {
      c = _children;
    }
    if (typeof c === "string" && boldSubstrings) {
      return (
        <ReplacedSubstrings substring={boldSubstrings} fontWeight="semibold">
          {c}
        </ReplacedSubstrings>
      );
    }
    return c;
  }, [_children, boldSubstrings, rest.isLocked, rest.isLoading, rest.isDisabled]);

  if (description && includeDescription) {
    return (
      <div className="menu__item__content-wrapper">
        <MenuItemContent
          {...rest}
          boldSubstrings={boldSubstrings}
          loadingText={loadingText}
          contentClassName={contentClassName}
        >
          {_children}
        </MenuItemContent>
        <Description component="div" className="menu__item__description">
          {description}
        </Description>
      </div>
    );
  }

  return (
    <div className={classNames("menu__item__content", contentClassName)}>
      <MenuItemLeftAffix {...rest} />
      {children !== null && children !== undefined && (
        <div className="menu__item__inner-content">
          {rest.isLoading && loadingText ? <LoadingText>{loadingText}</LoadingText> : children}
        </div>
      )}
      <Actions actions={rest.actions ?? []} />
    </div>
  );
};

export interface MenuItemProps
  extends ComponentProps,
    Omit<React.ComponentProps<"div">, "children" | "onClick" | "ref" | keyof ComponentProps>,
    Omit<MenuItemContentProps, "description" | "children"> {
  readonly description?: MenuItemRenderCallback<ReactNode>;
  readonly isCurrentNavigation?: boolean;
  readonly highlightOnHover?: boolean;
  readonly height?: QuantitativeSize<"px">;
  readonly selectedClassName?: ComponentProps["className"];
  readonly navigatedClassName?: ComponentProps["className"];
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly children: ReactNode | ((params: types.MenuItemRenderProps) => ReactNode);
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: types.ConnectedMenuItemInstance,
  ) => void;
}

export const MenuItem = forwardRef<types.ConnectedMenuItemInstance, MenuItemProps>(
  (
    {
      height,
      actions = [],
      boldSubstrings,
      isSelected = false,
      selectedClassName,
      loadingClassName,
      lockedClassName,
      disabledClassName,
      spinnerClassName,
      contentClassName,
      children,
      isCurrentNavigation = false,
      description,
      includeDescription,
      icon,
      iconClassName,
      navigatedClassName,
      iconSize,
      checkboxSize,
      isLoading: propIsLoading,
      isLocked: propIsLocked,
      isDisabled: propIsDisabled,
      selectionIndicator,
      loadingText,
      highlightOnHover = true,
      spinnerSize,
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
      isConnected: true as const,
      setLoading,
      setDisabled,
      setLocked,
    }));

    return (
      <div
        {...props}
        {...parseDataAttributes({
          isLoading,
          isDisabled,
          isLocked,
          isNavigated: isCurrentNavigation,
          isSelected:
            isSelected && types.menuItemHasSelectionIndicator(selectionIndicator, "highlight"),
          highlightOnHover,
        })}
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
              isConnected: true,
              setLoading,
              setDisabled,
              setLocked,
            });
          }
        }}
        className={classNames(
          "menu__item",
          { "pointer-events-auto cursor-pointer": props.onClick !== undefined },
          {
            [classNames(navigatedClassName)]: isCurrentNavigation,
            [classNames(selectedClassName)]: isSelected,
            [classNames(loadingClassName)]: isLoading,
            [classNames(disabledClassName)]: isDisabled,
            [classNames(lockedClassName)]: isLocked,
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
          boldSubstrings={boldSubstrings}
          actions={actions}
          spinnerClassName={spinnerClassName}
          spinnerSize={spinnerSize}
          checkboxSize={checkboxSize}
          icon={icon}
          description={
            typeof description === "function"
              ? params => description({ ...params, setLocked, setLoading, setDisabled })
              : description
          }
          includeDescription={includeDescription}
          iconClassName={iconClassName}
          iconSize={iconSize}
          contentClassName={contentClassName}
          isLoading={isLoading}
          isDisabled={isDisabled}
          isLocked={isLocked}
          selectionIndicator={selectionIndicator}
          isSelected={isSelected}
          loadingText={loadingText}
        >
          {typeof children === "function"
            ? params => children({ ...params, setLocked, setLoading, setDisabled })
            : children}
        </MenuItemContent>
      </div>
    );
  },
);
