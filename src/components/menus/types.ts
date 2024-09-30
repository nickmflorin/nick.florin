import { type ReactNode } from "react";

import { type IconProp, type IconName, type IconProps } from "~/components/icons";
import { type Action } from "~/components/structural/Actions";
import { type ComponentProps, type QuantitativeSize } from "~/components/types";
import { type LabelProps } from "~/components/typography";

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

export interface MenuFeedbackProps {
  readonly isEmpty?: boolean;
  readonly isError?: boolean;
  readonly hasNoResults?: boolean;
  readonly emptyContent?: string | JSX.Element;
  readonly noResultsContent?: string | JSX.Element;
  readonly errorTitle?: string;
  readonly errorMessage?: string;
  readonly errorContent?: string | JSX.Element;
  readonly feedbackClassName?: ComponentProps["className"];
  readonly feedbackStyle?: ComponentProps["style"];
}

export const hasFeedback = (
  props: Pick<MenuFeedbackProps, "isError" | "isEmpty" | "hasNoResults">,
) => props.isEmpty === true || props.isError === true || props.hasNoResults === true;

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

export type DataMenuGroupProps<M extends DataMenuModel> = {
  readonly groups?: DataMenuGroup<M>[];
  readonly hideEmptyGroups?: boolean;
  readonly hideGrouplessItems?: boolean;
  readonly groupsAreBordered?: boolean;
  readonly groupContentClassName?: ComponentProps["className"];
  readonly groupLabelContainerClassName?: ComponentProps["className"];
  readonly groupLabelProps?: Omit<LabelProps<"label">, "className" | "children">;
  readonly groupLabelClassName?: ComponentProps["className"];
};

export type DataMenuGroup<M extends DataMenuModel> = {
  readonly label?: ReactNode;
  readonly filter: (m: M) => boolean;
};

export type DataMenuItemCharacteristicsProps<M extends DataMenuModel> = {
  readonly itemClassName?: DataMenuItemClassName<M>;
  readonly itemHeight?: QuantitativeSize<"px">;
  readonly itemNavigatedClassName?: DataMenuItemClassName<M>;
  readonly itemSpinnerClassName?: DataMenuItemClassName<M>;
  readonly itemIconClassName?: DataMenuItemClassName<M>;
  readonly itemIconProps?: MenuItemIconProps;
  readonly itemIconSize?: QuantitativeSize<"px">;
  readonly itemDisabledClassName?: DataMenuItemClassName<M>;
  readonly itemLoadingClassName?: DataMenuItemClassName<M>;
  readonly itemLockedClassName?: DataMenuItemClassName<M>;
  readonly itemSelectedClassName?: DataMenuItemClassName<M>;
  readonly getItemIcon?: (
    datum: M,
    params: MenuItemRenderProps,
  ) => IconProp | IconName | JSX.Element | undefined;
  readonly getItemDescription?: (datum: M, params: MenuItemRenderProps) => ReactNode;
  readonly onItemClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent,
    datum: M,
    instance: MenuItemInstance,
  ) => void;
  readonly getItemId?: (datum: M) => string | number | undefined;
};

export type DataMenuProcessedGroup<M extends DataMenuModel> = {
  readonly label?: ReactNode;
  readonly isGroup: true;
  readonly data: { model: M; index: number }[];
};

type DataMenuProcessedModel<M extends DataMenuModel> = {
  readonly isGroup?: false;
  readonly model: M;
  readonly index: number;
};

export type DataMenuProcessedDatum<M extends DataMenuModel> =
  | DataMenuProcessedModel<M>
  | DataMenuProcessedGroup<M>;

export type DataMenuProcessedData<M extends DataMenuModel> = DataMenuProcessedDatum<M>[];
