import React, { type ReactNode } from "react";

import { omit, pick } from "lodash-es";

import { type ExtractValues } from "~/lib/types";

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
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};

export type MenuItemSelectionIndicatorType = "checkbox" | "highlight";

export type MenuItemSelectionIndicator =
  | "none"
  | MenuItemSelectionIndicatorType
  | MenuItemSelectionIndicatorType[];

export const menuItemHasSelectionIndicator = (
  indicator: MenuItemSelectionIndicator | undefined,
  check: MenuItemSelectionIndicatorType,
): boolean => {
  if (indicator === "none") {
    return false;
  }
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

type BaseDataMenuModel = {
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
  readonly className?: ComponentProps["className"];
  readonly label?: ReactNode;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
  readonly isVisible?: boolean;
  readonly actions?: Action[];
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent,
    instance: MenuItemInstance,
  ) => void;
};

export type DataMenuModel = BaseDataMenuModel & {
  readonly selectedClassName?: ComponentProps["className"];
  readonly isSelected?: boolean;
  [key: string]: unknown;
};

export type DataMenuCustomModel = BaseDataMenuModel & {
  readonly renderer?: DataMenuModelCustomRenderer;
};

export const dataMenuCustomModelIsObject = (
  m: DataMenuCustomModel | DataMenuModelCustomRenderer | JSX.Element,
): m is DataMenuCustomModel => typeof m !== "function" && !React.isValidElement(m);

export type DataMenuModelCallbackPropFn<M extends DataMenuModel, T = unknown> = (m: M) => T;

export type DataMenuCallbackProp<M extends DataMenuModel, T = unknown> =
  | T
  | DataMenuModelCallbackPropFn<M, T>;

export type DataMenuModelCallbackPropValue<
  M extends DataMenuModel,
  C extends DataMenuCallbackProp<M>,
> = C extends DataMenuCallbackProp<M, infer T> ? T | undefined : never;

export const extractValueFromCallbackProp = <
  M extends DataMenuModel,
  C extends DataMenuCallbackProp<M>,
>(
  value: C,
): DataMenuModelCallbackPropValue<M, C> =>
  typeof value === "function"
    ? (undefined as DataMenuModelCallbackPropValue<M, C>)
    : (value as DataMenuModelCallbackPropValue<M, C>);

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

type MenuItemFlagOuterName = ExtractValues<typeof MenuItemFlagOuterNames>;

const DataMenuItemDefaultFlags = {
  isDisabled: false,
  isLoading: false,
  isVisible: true,
  isLocked: false,
  isSelected: false,
};

const MenuItemFlagNames = [
  "isDisabled",
  "isLoading",
  "isVisible",
  "isLocked",
  "isSelected",
] as const;

type DataMenuItemFlagName = (typeof MenuItemFlagNames)[number];

export type DataMenuItemFlagProp<M extends DataMenuModel> = (model: M) => boolean;

export type DataMenuItemFlagProps<M extends DataMenuModel> = {
  [key in DataMenuItemFlagName as (typeof MenuItemFlagOuterNames)[key]]?: DataMenuItemFlagProp<M>;
};

export const omitDataMenuItemFlagProps = <P extends Record<string, unknown>>(
  props: P,
): Omit<P, DataMenuItemFlagName & keyof P> => omit(props, MenuItemFlagNames);

export const pickDataMenuItemFlagProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, DataMenuItemFlagName & keyof P> => pick(props, MenuItemFlagNames);

export const omitDataMenuItemOuterFlagProps = <P extends Record<string, unknown>>(
  props: P,
): Omit<P, MenuItemFlagOuterName & keyof P> => omit(props, Object.values(MenuItemFlagOuterNames));

export const pickDataMenuItemOuterFlagProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, MenuItemFlagOuterName & keyof P> => pick(props, Object.values(MenuItemFlagOuterNames));

export const evalMenuItemFlag = <M extends DataMenuModel, F extends DataMenuItemFlagName>(
  flag: F,
  prop: DataMenuItemFlagProp<M> | undefined,
  model: M,
): boolean => {
  const modelFlag = model[flag];
  if (modelFlag !== undefined) {
    return modelFlag;
  } else if (typeof prop === "function") {
    return prop(model);
  }
  return DataMenuItemDefaultFlags[flag];
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

export type DataMenuItemAccessorProps<M extends DataMenuModel> = {
  readonly getItemDescription?: (
    datum: M,
    params: Omit<MenuItemRenderProps, `set${string}`>,
  ) => ReactNode;
  readonly getItemId?: (datum: M) => string | number | undefined;
  readonly getItemIcon?: (
    datum: M,
    params: Omit<MenuItemRenderProps, `set${string}`>,
  ) => IconProp | IconName | JSX.Element | undefined;
};

export const DataMenuItemAccessorPropsMap = {
  getItemDescription: true,
  getItemId: true,
  getItemIcon: true,
} as const satisfies { [key in keyof DataMenuItemAccessorProps<DataMenuModel>]: true };

export const omitDataMenuItemAccessorProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
>(
  props: P,
): Omit<P, keyof typeof DataMenuItemAccessorPropsMap & keyof P> =>
  omit(
    props,
    Object.keys(DataMenuItemAccessorPropsMap) as (keyof Required<DataMenuItemAccessorProps<M>>)[],
  );

export const pickDataMenuItemAccessorProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
>(
  props: P,
): Pick<P, keyof typeof DataMenuItemAccessorPropsMap & keyof P> =>
  pick(
    props,
    Object.keys(DataMenuItemAccessorPropsMap) as (keyof Required<DataMenuItemAccessorProps<M>>)[],
  );

export type DataMenuItemClassNameProps<M extends DataMenuModel> = {
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
};

export type DataMenuProcessedGroup<M extends DataMenuModel> = {
  readonly label?: ReactNode;
  readonly isGroup: true;
  readonly isCustom?: false;
  readonly data: { model: M; index: number }[];
};

export type DataMenuProcessedModel<M extends DataMenuModel> = {
  readonly isGroup?: false;
  readonly isCustom?: false;
  readonly model: M;
  readonly index: number;
};

export type DataMenuModelCustomRenderer = (instance: MenuItemInstance) => JSX.Element;

export type DataMenuProcessedCustom = {
  readonly model: DataMenuCustomModel | JSX.Element;
  readonly index: number;
  readonly isCustom: true;
  readonly isGroup?: false;
};

export type DataMenuProcessedDatum<M extends DataMenuModel> =
  | DataMenuProcessedModel<M>
  | DataMenuProcessedGroup<M>
  | DataMenuProcessedCustom;

export type DataMenuProcessedData<M extends DataMenuModel> = DataMenuProcessedDatum<M>[];
