import { Checkbox } from "~/components/input/Checkbox";
import type { MenuItemSelectionIndicator } from "~/components/menus/types";
import { menuItemHasSelectionIndicator } from "~/components/menus/types";
import { ShowHide } from "~/components/util";

import { MenuItemSpinner, type MenuItemSpinnerProps } from "./MenuItemSpinner";

export interface MenuItemCheckboxProps extends MenuItemSpinnerProps {
  readonly isSelected: boolean | undefined;
  readonly isDisabled: boolean;
  readonly isLocked: boolean;
  readonly hasIcon: boolean;
  readonly selectionIndicator: MenuItemSelectionIndicator | undefined;
}

export const MenuItemCheckbox = ({
  selectionIndicator,
  isLocked,
  isDisabled,
  isSelected,
  hasIcon,
  ...props
}: MenuItemCheckboxProps) => (
  <ShowHide show={menuItemHasSelectionIndicator(selectionIndicator, "checkbox") && !hasIcon}>
    <div className="flex flex-col h-full w-auto aspect-square justify-center items-center">
      {props.isLoading ? (
        <MenuItemSpinner {...props} />
      ) : (
        <Checkbox readOnly value={isSelected} isDisabled={isDisabled} isLocked={isLocked} />
      )}
    </div>
  </ShowHide>
);
