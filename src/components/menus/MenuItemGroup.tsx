import { type ReactNode } from "react";

import { isFragment } from "react-is";

import { type ComponentProps, classNames } from "~/components/types";
import { Label, type LabelProps } from "~/components/typography";

import { MenuContent, type MenuContentProps } from "./MenuContent";

export interface MenuItemGroupProps extends MenuContentProps<"group"> {
  readonly label?: ReactNode;
  readonly contentClassName?: ComponentProps["className"];
  readonly labelContainerClassName?: ComponentProps["className"];
  readonly labelProps?: Omit<LabelProps<"label">, "className" | "children" | "ref">;
  readonly labelClassName?: ComponentProps["className"];
}

export const MenuItemGroup = ({
  label,
  labelClassName,
  children,
  labelContainerClassName,
  className,
  labelProps,
  contentClassName,
  style,
  ...props
}: MenuItemGroupProps): JSX.Element => {
  const validChildren = (
    Array.isArray(children) ? children : children !== undefined ? [children] : []
  ).filter((ch): ch is JSX.Element => !isFragment(ch) && ch !== null);

  if (validChildren.length === 0) {
    return <></>;
  }
  return (
    <div style={style} className={classNames("menu__item-group", className)}>
      {label && !isFragment(label) && (
        <div className={classNames("menu__item-group__label-container", labelContainerClassName)}>
          {typeof label === "string" ? (
            <Label
              fontSize="sm"
              {...labelProps}
              className={classNames("menu__item-group__label", labelClassName)}
            >
              {label}
            </Label>
          ) : (
            label
          )}
        </div>
      )}
      <MenuContent __private_parent_prop__="group" {...props} className={contentClassName}>
        {validChildren}
      </MenuContent>
    </div>
  );
};

export default MenuItemGroup;
