import React, { type ReactNode } from "react";

import { omit, pick } from "lodash-es";

import type { Optional } from "utility-types";

import { type ExtractValues } from "~/lib/types";

import { type IconProp, type IconName } from "~/components/icons";
import { type Action } from "~/components/structural/Actions";
import { type ComponentProps, type QuantitativeSize } from "~/components/types";
import { type LabelProps } from "~/components/typography";

import { type DataMenuProps } from "./DataMenu";

export type MenuItemClickEvent = React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent;

/**
 * Represents a more specific sub-type of {@link MenuItemInstance} that has NOT been connected to
 * the UI yet.  In other words, the ref-relationship between the
 * {@link DisconnectedMenuItemInstance} and the MenuItem has not yet been established, because the
 * MenuItem has not yet been rendered in the UI.
 *
 * This can happen when optimistic models are added to the data rendered by a DataMenu.  In certain
 * cases, the {@link MenuItemInstance} associated with the model will have to be created before
 * the MenuItem associated with the model is rendered in the UI.
 */
export type DisconnectedMenuItemInstance = {
  readonly isConnected: false;
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};

/**
 * Represents a more specific sub-type of {@link MenuItemInstance} that has been connected to
 * the UI.  When the MenuItem associated with the {@link DisconnectedMenuItemInstance} is rendered
 * in the UI, the {@link DisconnectedMenuItemInstance} becomes a {@link ConnectedMenuItemInstance}
 * because the ref-relationship with the MenuItem is established when it is rendered.
 */
export type ConnectedMenuItemInstance = {
  readonly isConnected?: true;
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};

export type MenuItemInstance = DisconnectedMenuItemInstance | ConnectedMenuItemInstance;

export type DataMenuModelClickHandler = (
  e: MenuItemClickEvent,
  instance: ConnectedMenuItemInstance,
) => void;

/* ---------------------------------- Data Menu Model -----------------------------------------*/
export type BaseDataMenuModel<C = DataMenuModelClickHandler> = {
  readonly icon?: IconProp | IconName | JSX.Element;
  readonly description?: ReactNode;
  readonly iconSize?: QuantitativeSize<"px">;
  readonly checkboxSize?: QuantitativeSize<"px">;
  readonly spinnerSize?: QuantitativeSize<"px">;
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
  readonly onClick?: C;
};

export type DataMenuModel = BaseDataMenuModel & {
  readonly id?: string | number;
  readonly selectedClassName?: ComponentProps["className"];
  readonly isSelected?: boolean;
  readonly renderer?: never;
  readonly isCustom?: never;
};

export type DataMenuModelCustomRenderer = (instance: ConnectedMenuItemInstance) => JSX.Element;

export type DataMenuCustomModelLocation = "before-content" | "after-content";

export type DataMenuCustomModel<C = DataMenuModelClickHandler> = BaseDataMenuModel<C> & {
  readonly id: string;
  readonly isCustom: true;
  readonly location?: DataMenuCustomModelLocation;
  readonly selectedClassName?: never;
  readonly isSelected?: never;
  readonly renderer?: DataMenuModelCustomRenderer;
};

export type GetDataMenuModelId<
  M extends DataMenuModel,
  I extends string | number = string | number,
> = (datum: M) => I;

export type DataMenuModelId<M extends DataMenuModel, O extends DataMenuOptions<M>> = O extends {
  getModelId: infer Fn;
}
  ? Fn extends GetDataMenuModelId<M, infer I extends string | number>
    ? I
    : never
  : M extends { id: infer V extends string | number }
    ? V
    : never;

export type DataMenuCustomModelRefKey = `custom-${string}`;

export const getDataMenuModelId = <
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
  P extends { readonly strict?: boolean },
>(
  m: M,
  options: O,
  params?: P,
): P extends { strict: true } ? DataMenuModelId<M, O> : DataMenuModelId<M, O> | null => {
  if (options.getModelId !== undefined) {
    return options.getModelId(m) as DataMenuModelId<M, O>;
  } else if (m.id !== undefined) {
    return m.id as DataMenuModelId<M, O>;
  } else if (params?.strict) {
    throw new Error(
      "Encountered a model for which the id could not be constructed.  The model itself " +
        "did not define an 'id' property, and the 'getModelId' option was not defined.",
    );
  }
  return null as P extends { strict: true } ? DataMenuModelId<M, O> : DataMenuModelId<M, O> | null;
};

export type GetDataMenuModelRefKey<
  M extends DataMenuModel,
  K extends string | number = string | number,
> = (m: M) => K;

export type DataMenuModelRefKey<M extends DataMenuModel, O extends DataMenuOptions<M>> = O extends {
  getModelRefKey: infer Fn;
}
  ? Fn extends GetDataMenuModelRefKey<M, infer K extends string | number>
    ? K
    : never
  : DataMenuModelId<M, O>;

export const getDataMenuModelRefKey = <
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
  P extends { readonly strict?: boolean },
>(
  m: M,
  options: O,
  params?: P,
): P extends { strict: true } ? DataMenuModelRefKey<M, O> : DataMenuModelRefKey<M, O> | null => {
  if (options.getModelRefKey !== undefined) {
    return options.getModelRefKey(m) as DataMenuModelRefKey<M, O>;
  }
  const id = getDataMenuModelId(m, options, { strict: false });
  if (id !== null) {
    return id as DataMenuModelRefKey<M, O>;
  } else if (params?.strict) {
    throw new Error(
      "Encountered a model for which the ref key could not be constructed.  The model itself " +
        "did not define either an 'id' property or a 'refKey' property, and both the " +
        "'getModelRefKey' and 'getModelId' options were not defined.",
    );
  }
  return null as P extends { strict: true }
    ? DataMenuModelRefKey<M, O>
    : DataMenuModelRefKey<M, O> | null;
};

export type DataMenuOptions<M extends DataMenuModel> = {
  readonly getModelRefKey?: GetDataMenuModelRefKey<M>;
  readonly getModelId?: GetDataMenuModelId<M>;
};

export const dataMenuModelArgIsCustomModel = <M extends DataMenuModel>(
  m: M | DataMenuCustomModel | JSX.Element,
): m is DataMenuCustomModel => (m as DataMenuCustomModel).isCustom;

export const dataMenuCustomModelIsObj = <
  O extends Optional<DataMenuCustomModel<C>, "isCustom">,
  C extends (...args: any[]) => void = DataMenuModelClickHandler,
>(
  m: O | JSX.Element,
): m is O => (m as DataMenuCustomModel<C>).id !== undefined;

export const dataMenuModelArgIsModel = <M extends DataMenuModel>(
  m: M | DataMenuCustomModel | JSX.Element,
): m is M =>
  typeof m !== "function" &&
  !React.isValidElement(m) &&
  (m as DataMenuModel).isCustom === undefined;

/* ---------------------------------- Data Menu Props -----------------------------------------*/

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

const CustomMenuItemFlagNames = ["isDisabled", "isLoading", "isVisible", "isLocked"] as const;

type DataMenuCustomItemFlagName = (typeof CustomMenuItemFlagNames)[number];

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

export function evalMenuItemFlag<M extends DataMenuModel, F extends DataMenuItemFlagName>(
  flag: F,
  model: M,
  prop: DataMenuItemFlagProp<M> | undefined,
): boolean;

export function evalMenuItemFlag<F extends DataMenuCustomItemFlagName>(
  flag: F,
  model: DataMenuCustomModel,
): boolean;

export function evalMenuItemFlag<
  M extends DataMenuModel,
  F extends DataMenuItemFlagName | DataMenuCustomItemFlagName,
>(flag: F, model: M, prop?: DataMenuItemFlagProp<M>): boolean {
  const modelFlag = model[flag];
  if (modelFlag !== undefined) {
    return modelFlag;
  } else if (typeof prop === "function") {
    return prop(model);
  }
  return DataMenuItemDefaultFlags[flag];
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
  readonly getItemIcon?: (
    datum: M,
    params: Omit<MenuItemRenderProps, `set${string}`>,
  ) => IconProp | IconName | JSX.Element | undefined;
};

export const DataMenuItemAccessorPropsMap = {
  getItemDescription: true,
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

export type DataMenuItemClassNameProps<
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  C extends DataMenuItemClassName<any> | ComponentProps["className"],
> = {
  readonly itemClassName?: C;
  readonly itemNavigatedClassName?: C;
  readonly itemSpinnerClassName?: C;
  readonly itemIconClassName?: C;
  readonly itemDisabledClassName?: C;
  readonly itemLoadingClassName?: C;
  readonly itemLockedClassName?: C;
  readonly itemSelectedClassName?: C;
};

export type DataMenuItemSizeProps = {
  readonly itemIconSize?: QuantitativeSize<"px">;
  readonly itemSpinnerSize?: QuantitativeSize<"px">;
  readonly itemCheckboxSize?: QuantitativeSize<"px">;
  readonly itemHeight?: QuantitativeSize<"px">;
};

/* ------------------------------ Data Menu Model Processing -----------------------------------*/
export type DataMenuProcessedGroup<M extends DataMenuModel> = {
  readonly label?: ReactNode;
  readonly isGroup: true;
  readonly isCustom?: never;
  readonly data: DataMenuProcessedModel<M>[];
};

export type DataMenuProcessedModel<M extends DataMenuModel> = {
  readonly isGroup?: false;
  readonly isCustom: false;
  readonly model: M;
  readonly index: number;
};

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

export type DataMenuFlattenedProcessedData<M extends DataMenuModel> = (
  | DataMenuProcessedModel<M>
  | DataMenuProcessedCustom
)[];

/* -------------------------- Data Menu Item Instance Management -------------------------------*/
export type DataMenuItemInstances<M extends BaseDataMenuModel, O extends DataMenuOptions<M>> = {
  [key in DataMenuModelRefKey<M, O> | DataMenuCustomModelRefKey]: MenuItemInstance;
};

export type DataMenuItemInstanceLookupArg<M extends DataMenuModel, O extends DataMenuOptions<M>> =
  | M
  | DataMenuCustomModelRefKey
  | DataMenuModelRefKey<M, O>
  | DataMenuCustomModel;

export const menuItemInstanceLookupArgIsModel = <
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
>(
  arg: DataMenuItemInstanceLookupArg<M, O>,
): arg is M | DataMenuCustomModel => typeof arg !== "string" && typeof arg !== "number";

export type CreateDataMenuItemInstanceOptions = {
  readonly strict?: boolean;
};

export type CreateDataMenuItemInstanceRT<O extends CreateDataMenuItemInstanceOptions> = O extends {
  strict: true;
}
  ? DisconnectedMenuItemInstance
  : DisconnectedMenuItemInstance | null;

export type MenuModelInstancesManagerGetKeyRT<
  A extends DataMenuItemInstanceLookupArg<M, O>,
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
> = A extends DataMenuCustomModelRefKey | DataMenuCustomModel
  ? DataMenuCustomModelRefKey
  : DataMenuModelRefKey<M, O>;

export interface MenuModelInstancesManager<
  M extends BaseDataMenuModel,
  O extends DataMenuOptions<M>,
> {
  readonly connect: (
    m: DataMenuItemInstanceLookupArg<M, O>,
    instance: ConnectedMenuItemInstance,
  ) => void;
  readonly getKey: <A extends DataMenuItemInstanceLookupArg<M, O>>(
    args: A,
  ) => MenuModelInstancesManagerGetKeyRT<A, M, O>;
  readonly exists: (k: DataMenuItemInstanceLookupArg<M, O>) => boolean;
  readonly get: (k: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance | null;
  readonly create: <CO extends CreateDataMenuItemInstanceOptions>(
    k: DataMenuItemInstanceLookupArg<M, O>,
    opts?: CO,
  ) => CreateDataMenuItemInstanceRT<CO>;
  readonly createIfNecessary: (
    k: DataMenuItemInstanceLookupArg<M, O>,
  ) => DisconnectedMenuItemInstance | null;
  readonly getOrCreate: (k: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance;
}

/* -------------------------------- Data Menu Instances -------------------------------------*/
export interface DataMenuContentInstance<M extends DataMenuModel, O extends DataMenuOptions<M>> {
  readonly getInstance: (m: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance | null;
  readonly getOrCreateInstance: (m: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance;
  readonly createInstanceIfNecessary: (
    m: DataMenuItemInstanceLookupArg<M, O>,
  ) => DisconnectedMenuItemInstance | null;
  readonly createInstance: <CO extends CreateDataMenuItemInstanceOptions>(
    k: DataMenuItemInstanceLookupArg<M, O>,
    opts?: CO,
  ) => CreateDataMenuItemInstanceRT<CO>;
  readonly focus: () => void;
  readonly incrementNavigatedIndex: () => void;
  readonly decrementNavigatedIndex: () => void;
}

export type DataMenuInstance<
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
> = DataMenuContentInstance<M, O>;

export const DataMenuPropsMap = {
  data: true,
  options: true,
  header: true,
  footer: true,
  search: true,
  id: true,
  className: true,
  style: true,
  enableKeyboardInteractions: true,
  selectionIndicator: true,
  children: true,
  includeDescriptions: true,
  __private_parent_prop__: true,
  boldSubstrings: true,
  // ~~~~~~~~ Event Handlers ~~~~~~~~
  onFocus: true,
  onBlur: true,
  onSearch: true,
  onKeyboardNavigationExit: true,
  // ~~~~~~~~ State ~~~~~~~~
  isDisabled: true,
  isLocked: true,
  isBordered: true,
  isLoading: true,
  itemIsDisabled: true,
  itemIsLoading: true,
  itemIsLocked: true,
  itemIsSelected: true,
  itemIsVisible: true,
  // ~~~~~~~~ Groups ~~~~~~~~
  groups: true,
  hideEmptyGroups: true,
  hideGrouplessItems: true,
  groupContentClassName: true,
  groupLabelClassName: true,
  groupLabelContainerClassName: true,
  groupLabelProps: true,
  groupsAreBordered: true,
  // ~~~~~~~~ Item Size Characteristics ~~~~~~~~
  itemIconSize: true,
  itemSpinnerSize: true,
  itemHeight: true,
  itemCheckboxSize: true,
  // ~~~~~~~~ Item Accessor Characteristics ~~~~~~~~
  getItemIcon: true,
  getItemDescription: true,
  // ~~~~~~~~ Item Class Name Characteristics ~~~~~~~~
  itemSelectedClassName: true,
  itemClassName: true,
  itemNavigatedClassName: true,
  itemSpinnerClassName: true,
  itemLockedClassName: true,
  itemIconClassName: true,
  itemDisabledClassName: true,
  itemLoadingClassName: true,
  // ~~~~~~~~ Event Handlers ~~~~~~~~
  onItemClick: true,
  // ~~~~~~~~ Feedback Props ~~~~~~~~
  isEmpty: true,
  isError: true,
  hasNoResults: true,
  emptyContent: true,
  noResultsContent: true,
  errorTitle: true,
  errorMessage: true,
  errorContent: true,
  feedbackClassName: true,
  feedbackStyle: true,
  customItems: true,
} as const satisfies {
  [key in keyof Required<DataMenuProps<DataMenuModel, DataMenuOptions<DataMenuModel>>>]: true;
};

export const omitDataMenuProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
>(
  props: P,
): Omit<P, keyof typeof DataMenuPropsMap & keyof P> =>
  omit(props, Object.keys(DataMenuPropsMap) as (keyof Required<DataMenuProps<M, O>>)[]);

export const pickDataMenuProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
>(
  props: P,
): Pick<P, keyof typeof DataMenuPropsMap & keyof P> =>
  pick(props, Object.keys(DataMenuPropsMap) as (keyof Required<DataMenuProps<M, O>>)[]);
