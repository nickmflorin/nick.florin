import { Checkbox } from "~/components/input/Checkbox";
import { Square } from "~/components/util";

import { MenuItemSpinner, type MenuItemSpinnerProps } from "./MenuItemSpinner";

export interface MenuItemCheckboxProps extends MenuItemSpinnerProps {
  readonly isSelected: boolean | undefined;
  readonly isDisabled: boolean;
  readonly isLocked: boolean;
  readonly isLoading: boolean;
}

export const MenuItemCheckbox = ({
  isLocked,
  isDisabled,
  isSelected,
  isLoading,
  // hasIcon,
  ...props
}: MenuItemCheckboxProps) => (
  <Square>
    {isLoading ? (
      <MenuItemSpinner {...props} />
    ) : (
      <Checkbox readOnly value={isSelected} isDisabled={isDisabled} isLocked={isLocked} />
    )}
  </Square>
);
