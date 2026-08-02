import { isValidElement, type JSX, type ReactNode } from 'react';

import { type Optional } from 'utility-types';

import { type IconName, type IconProp } from '~/components/icons';
import { type Action } from '~/components/structural/Actions';
import { type ComponentProps, type QuantitativeSize } from '~/components/types';

import {
  type ConnectedMenuItemInstance,
  type DataMenuModelClickHandler,
} from './menu-item-instances';

/* ---------------------------------- Data Menu Model -----------------------------------------*/
export type BaseDataMenuModel<C = DataMenuModelClickHandler> = {
  readonly actions?: Action[];
  readonly checkboxSize?: QuantitativeSize<'px'>;
  readonly className?: ComponentProps['className'];
  readonly description?: ReactNode;
  readonly disabledClassName?: ComponentProps['className'];
  readonly icon?: IconName | IconProp | JSX.Element;
  readonly iconClassName?: ComponentProps['className'];
  readonly iconSize?: QuantitativeSize<'px'>;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isLocked?: boolean;
  readonly isVisible?: boolean;
  readonly label?: ReactNode;
  readonly loadingClassName?: ComponentProps['className'];
  readonly lockedClassName?: ComponentProps['className'];
  readonly onClick?: C;
  readonly spinnerClassName?: ComponentProps['className'];
  readonly spinnerSize?: QuantitativeSize<'px'>;
};

export type DataMenuModel = {
  readonly id?: number | string;
  readonly isCustom?: never;
  readonly isSelected?: boolean;
  readonly renderer?: never;
  readonly selectedClassName?: ComponentProps['className'];
} & BaseDataMenuModel;

export type DataMenuModelCustomRenderer = (instance: ConnectedMenuItemInstance) => JSX.Element;

export type DataMenuCustomModelLocation = 'after-content' | 'before-content';

export type DataMenuCustomModel<C = DataMenuModelClickHandler> = {
  readonly id: string;
  readonly isCustom: true;
  readonly isSelected?: never;
  readonly location?: DataMenuCustomModelLocation;
  readonly renderer?: DataMenuModelCustomRenderer;
  readonly selectedClassName?: never;
} & BaseDataMenuModel<C>;

export type GetDataMenuModelId<
  M extends DataMenuModel,
  I extends number | string = number | string,
> = (datum: M) => I;

export type DataMenuModelId<M extends DataMenuModel, O extends DataMenuOptions<M>> = O extends {
  getModelId: infer Fn;
}
  ? Fn extends GetDataMenuModelId<M, infer I extends number | string>
    ? I
    : never
  : M extends { id: infer V extends number | string }
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
      'Encountered a model for which the id could not be constructed.  The model itself ' +
        "did not define an 'id' property, and the 'getModelId' option was not defined.",
    );
  }
  return null as P extends { strict: true } ? DataMenuModelId<M, O> : DataMenuModelId<M, O> | null;
};

export type GetDataMenuModelRefKey<
  M extends DataMenuModel,
  K extends number | string = number | string,
> = (m: M) => K;

export type DataMenuModelRefKey<M extends DataMenuModel, O extends DataMenuOptions<M>> = O extends {
  getModelRefKey: infer Fn;
}
  ? Fn extends GetDataMenuModelRefKey<M, infer K extends number | string>
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
      'Encountered a model for which the ref key could not be constructed.  The model itself ' +
        "did not define either an 'id' property or a 'refKey' property, and both the " +
        "'getModelRefKey' and 'getModelId' options were not defined.",
    );
  }
  return null as P extends { strict: true }
    ? DataMenuModelRefKey<M, O>
    : DataMenuModelRefKey<M, O> | null;
};

export type DataMenuOptions<M extends DataMenuModel> = {
  readonly getModelId?: GetDataMenuModelId<M>;
  readonly getModelRefKey?: GetDataMenuModelRefKey<M>;
};

export const dataMenuModelArgIsCustomModel = <M extends DataMenuModel>(
  m: DataMenuCustomModel | JSX.Element | M,
): m is DataMenuCustomModel => (m as DataMenuCustomModel).isCustom;

export const dataMenuCustomModelIsObj = <
  O extends Optional<DataMenuCustomModel<C>, 'isCustom'>,
  C extends (...args: any[]) => void = DataMenuModelClickHandler,
>(
  m: JSX.Element | O,
): m is O => !isValidElement(m);

export const dataMenuModelArgIsModel = <M extends DataMenuModel>(
  m: DataMenuCustomModel | JSX.Element | M,
): m is M => typeof m !== 'function' && !isValidElement(m) && !dataMenuModelArgIsCustomModel(m);
