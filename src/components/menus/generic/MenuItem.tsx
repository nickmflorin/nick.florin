import { type ReactNode } from "react";

import clsx from "clsx";

import { Checkbox } from "~/components/input/Checkbox";
import { type ComponentProps, type Size, type HTMLElementProps } from "~/components/types";

export interface MenuItemProps extends ComponentProps, HTMLElementProps<"div"> {
  readonly itemHeight?: Size;
  readonly isSelected: boolean;
  readonly selectedClassName?: ComponentProps["className"];
  readonly children: ReactNode;
  readonly isMulti?: boolean;
}

export const MenuItem = ({
  itemHeight,
  isSelected = false,
  isMulti = false,
  selectedClassName,
  children,
  ...props
}: MenuItemProps): JSX.Element => (
  <div
    {...props}
    className={clsx(
      "menu__item",
      { [clsx("menu__item--selected", selectedClassName)]: isSelected },
      props.className,
    )}
    style={itemHeight !== undefined ? { ...props.style, height: itemHeight } : props.style}
  >
    {isMulti && <Checkbox readOnly checked={isSelected} />}
    <div className="menu__item__content">{children}</div>
  </div>
);
