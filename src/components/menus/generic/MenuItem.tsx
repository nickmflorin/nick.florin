import { type ReactNode } from "react";

import clsx from "clsx";

import { Spinner } from "~/components/icons/Spinner";
import { Checkbox } from "~/components/input/Checkbox";
import { type ComponentProps, type Size, type HTMLElementProps } from "~/components/types";
import { ShowHide } from "~/components/util";

export interface MenuItemProps extends ComponentProps, HTMLElementProps<"div"> {
  readonly itemHeight?: Size;
  readonly isSelected: boolean;
  readonly selectedClassName?: ComponentProps["className"];
  readonly disabledClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly children: ReactNode;
  readonly isMulti?: boolean;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isLocked?: boolean;
  readonly isVisible?: boolean;
}

export const MenuItem = ({
  itemHeight,
  isSelected = false,
  isMulti = false,
  selectedClassName,
  loadingClassName,
  lockedClassName,
  disabledClassName,
  children,
  isLoading = false,
  isDisabled = false,
  isLocked = false,
  isVisible = true,
  ...props
}: MenuItemProps): JSX.Element => (
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
        {
          [clsx("menu__item--selected", selectedClassName)]: isSelected,
          [clsx("menu__item--loading", loadingClassName)]: isLoading,
          [clsx("disabled", disabledClassName)]: isDisabled,
          [clsx("menu__item--locked", lockedClassName)]: isLocked,
        },
        props.className,
      )}
      style={itemHeight !== undefined ? { ...props.style, height: itemHeight } : props.style}
    >
      {isMulti && (
        <Checkbox readOnly value={isSelected} isDisabled={isDisabled} isLocked={isLocked} />
      )}
      <div className="menu__item__content">{children}</div>
      <Spinner isLoading={isLoading} size="18px" dimension="height" />
    </div>
  </ShowHide>
);
