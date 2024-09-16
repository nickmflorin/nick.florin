import { type ReactNode } from "react";

import { type IconProp, type IconName, type IconProps } from "~/components/icons";
import { type Action } from "~/components/structural/Actions";
import { type ComponentProps, type QuantitativeSize } from "~/components/types";

export type MenuItemInstance = {
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};

export type MenuItemRenderProps = {
  readonly isLocked: boolean;
  readonly isDisabled: boolean;
  readonly isLoading: boolean;
};

export type MenuItemSelectionIndicatorType = "checkbox" | "highlight";

export type MenuItemSelectionIndicator =
  | MenuItemSelectionIndicatorType
  | MenuItemSelectionIndicatorType[];

export const menuItemHasSelectionIndicator = (
  indicator: MenuItemSelectionIndicator | undefined,
  check: MenuItemSelectionIndicatorType,
): boolean => {
  const ind = indicator ?? ["highlight"];
  if (Array.isArray(ind)) {
    return Array.isArray(check) ? check.every(ind.includes) : ind.includes(check);
  }
  return check === ind;
};

export type MenuItemIconProps = Omit<
  IconProps,
  "size" | "className" | "icon" | "name" | "iconStyle" | "family" | "children"
>;

const MenuItemFlagNames = [
  "isDisabled",
  "isLoading",
  "isVisible",
  "isLocked",
  "isSelected",
] as const;

type MenuItemFlagName = (typeof MenuItemFlagNames)[number];

export type DataMenuModel = {
  readonly id?: string | number;
  readonly icon?: IconProp | IconName | JSX.Element;
  readonly description?: ReactNode;
  readonly iconProps?: MenuItemIconProps;
  readonly iconSize?: QuantitativeSize<"px">;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly disabledClassName?: ComponentProps["className"];
  readonly loadingClassName?: ComponentProps["className"];
  readonly lockedClassName?: ComponentProps["className"];
  readonly selectedClassName?: ComponentProps["className"];
  readonly className?: ComponentProps["className"];
  readonly label?: ReactNode;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isSelected?: boolean;
  readonly isDisabled?: boolean;
  readonly isVisible?: boolean;
  readonly actions?: Action[];
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: MenuItemInstance,
  ) => void;
  [key: string]: unknown;
};

export type DataMenuItemClassName<M extends DataMenuModel> =
  | ComponentProps["className"]
  | ((datum: M) => ComponentProps["className"]);

const MenuItemFlagOuterNames = {
  isDisabled: "itemIsDisabled",
  isLoading: "itemIsLoading",
  isVisible: "itemIsVisible",
  isLocked: "itemIsLocked",
  isSelected: "itemIsSelected",
} as const;

const MenuItemDefaultFlags = {
  isDisabled: false,
  isLoading: false,
  isVisible: true,
  isLocked: false,
  isSelected: false,
};

type MenuItemFlagProp<M extends DataMenuModel> = (model: M) => boolean;

export type MenuItemFlagProps<M extends DataMenuModel> = {
  [key in MenuItemFlagName as (typeof MenuItemFlagOuterNames)[key]]?: MenuItemFlagProp<M>;
};

export const evalMenuItemFlag = <M extends DataMenuModel, F extends MenuItemFlagName>(
  flag: F,
  prop: MenuItemFlagProp<M> | undefined,
  model: M,
): boolean => {
  const modelFlag = model[flag];
  if (modelFlag !== undefined) {
    return modelFlag;
  } else if (typeof prop === "function") {
    return prop(model);
  }
  return MenuItemDefaultFlags[flag];
};

export interface DataMenuContentInstance {
  readonly focus: () => void;
  readonly incrementNavigatedIndex: () => void;
  readonly decrementNavigatedIndex: () => void;
}

export type DataMenuGroup<M extends DataMenuModel> = {
  readonly label?: ReactNode;
  readonly filter: (m: M) => boolean;
};
