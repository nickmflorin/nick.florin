import { type JSX, type ReactNode } from 'react';

import { omit, pick } from 'lodash-es';

import { type ExtractValues } from '~/lib/types';

import { type IconName, type IconProp } from '~/components/icons';
import { type ComponentProps, type QuantitativeSize } from '~/components/types';
import { type LabelProps } from '~/components/typography';

import { type DataMenuCustomModel, type DataMenuModel } from './data-menu-models';

/* ---------------------------------- Data Menu Props -----------------------------------------*/

export type MenuItemRenderProps = {
  readonly isDisabled: boolean;
  readonly isLoading: boolean;
  readonly isLocked: boolean;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
  readonly setLocked: (value: boolean) => void;
};

export type MenuItemSelectionIndicatorType = 'checkbox' | 'highlight';

export type MenuItemSelectionIndicator =
  'none' | MenuItemSelectionIndicatorType | MenuItemSelectionIndicatorType[];

export const menuItemHasSelectionIndicator = (
  indicator: MenuItemSelectionIndicator | undefined,
  check: MenuItemSelectionIndicatorType,
): boolean => {
  if (indicator === 'none') {
    return false;
  }
  const ind = indicator ?? ['highlight'];
  if (Array.isArray(ind)) {
    return Array.isArray(check) ? check.every(ind.includes) : ind.includes(check);
  }
  return check === ind;
};

export interface MenuFeedbackProps {
  readonly emptyContent?: JSX.Element | string;
  readonly errorContent?: JSX.Element | string;
  readonly errorMessage?: string;
  readonly errorTitle?: string;
  readonly feedbackClassName?: ComponentProps['className'];
  readonly feedbackStyle?: ComponentProps['style'];
  readonly hasNoResults?: boolean;
  readonly isEmpty?: boolean;
  readonly isError?: boolean;
  readonly noResultsContent?: JSX.Element | string;
}

export const hasFeedback = (
  props: Pick<MenuFeedbackProps, 'hasNoResults' | 'isEmpty' | 'isError'>,
) => props.isEmpty === true || props.isError === true || props.hasNoResults === true;

export type DataMenuModelCallbackPropFn<M extends DataMenuModel, T = unknown> = (m: M) => T;

export type DataMenuCallbackProp<M extends DataMenuModel, T = unknown> =
  DataMenuModelCallbackPropFn<M, T> | T;

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
  typeof value === 'function'
    ? (undefined as DataMenuModelCallbackPropValue<M, C>)
    : (value as DataMenuModelCallbackPropValue<M, C>);

export type DataMenuItemClassName<M extends DataMenuModel> =
  ((datum: M) => ComponentProps['className']) | ComponentProps['className'];

const MenuItemFlagOuterNames = {
  isDisabled: 'itemIsDisabled',
  isLoading: 'itemIsLoading',
  isLocked: 'itemIsLocked',
  isSelected: 'itemIsSelected',
  isVisible: 'itemIsVisible',
} as const;

type MenuItemFlagOuterName = ExtractValues<typeof MenuItemFlagOuterNames>;

const DataMenuItemDefaultFlags = {
  isDisabled: false,
  isLoading: false,
  isLocked: false,
  isSelected: false,
  isVisible: true,
};

const MenuItemFlagNames = [
  'isDisabled',
  'isLoading',
  'isVisible',
  'isLocked',
  'isSelected',
] as const;

type DataMenuItemFlagName = (typeof MenuItemFlagNames)[number];

type DataMenuCustomItemFlagName = 'isDisabled' | 'isLoading' | 'isLocked' | 'isVisible';

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
): Omit<P, keyof P & MenuItemFlagOuterName> => omit(props, Object.values(MenuItemFlagOuterNames));

export const pickDataMenuItemOuterFlagProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, keyof P & MenuItemFlagOuterName> => pick(props, Object.values(MenuItemFlagOuterNames));

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
  F extends DataMenuCustomItemFlagName | DataMenuItemFlagName,
>(flag: F, model: M, prop?: DataMenuItemFlagProp<M>): boolean {
  const modelFlag = model[flag];
  if (modelFlag !== undefined) {
    return modelFlag;
  } else if (typeof prop === 'function') {
    return prop(model);
  }
  return DataMenuItemDefaultFlags[flag];
}

export type DataMenuGroupProps<M extends DataMenuModel> = {
  readonly groupContentClassName?: ComponentProps['className'];
  readonly groupLabelClassName?: ComponentProps['className'];
  readonly groupLabelContainerClassName?: ComponentProps['className'];
  readonly groupLabelProps?: Omit<LabelProps<'label'>, 'children' | 'className'>;
  readonly groups?: DataMenuGroup<M>[];
  readonly groupsAreBordered?: boolean;
  readonly hideEmptyGroups?: boolean;
  readonly hideGrouplessItems?: boolean;
};

export type DataMenuGroup<M extends DataMenuModel> = {
  readonly filter: (m: M) => boolean;
  readonly label?: ReactNode;
};

export type DataMenuItemAccessorProps<M extends DataMenuModel> = {
  readonly getItemDescription?: (
    datum: M,
    params: Omit<MenuItemRenderProps, `set${string}`>,
  ) => ReactNode;
  readonly getItemIcon?: (
    datum: M,
    params: Omit<MenuItemRenderProps, `set${string}`>,
  ) => IconName | IconProp | JSX.Element | undefined;
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
): Omit<P, keyof P & keyof typeof DataMenuItemAccessorPropsMap> =>
  omit(
    props,
    Object.keys(DataMenuItemAccessorPropsMap) as (keyof Required<DataMenuItemAccessorProps<M>>)[],
  );

export const pickDataMenuItemAccessorProps = <
  P extends Record<string, unknown>,
  M extends DataMenuModel,
>(
  props: P,
): Pick<P, keyof P & keyof typeof DataMenuItemAccessorPropsMap> =>
  pick(
    props,
    Object.keys(DataMenuItemAccessorPropsMap) as (keyof Required<DataMenuItemAccessorProps<M>>)[],
  );

export type DataMenuItemClassNameProps<
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  C extends ComponentProps['className'] | DataMenuItemClassName<any>,
> = {
  readonly itemClassName?: C;
  readonly itemDisabledClassName?: C;
  readonly itemIconClassName?: C;
  readonly itemLoadingClassName?: C;
  readonly itemLockedClassName?: C;
  readonly itemNavigatedClassName?: C;
  readonly itemSelectedClassName?: C;
  readonly itemSpinnerClassName?: C;
};

export type DataMenuItemSizeProps = {
  readonly itemCheckboxSize?: QuantitativeSize<'px'>;
  readonly itemHeight?: QuantitativeSize<'px'>;
  readonly itemIconSize?: QuantitativeSize<'px'>;
  readonly itemSpinnerSize?: QuantitativeSize<'px'>;
};
