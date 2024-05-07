import { type ReactNode } from "react";

import { type DrawerIdPropsPair } from "~/components/drawers";
import { type IconProp, type IconSize } from "~/components/icons";
import { type Action } from "~/components/structural";
import { type ComponentProps } from "~/components/types";

import { type MenuItemInstance, type MenuItemHref } from "./item";
import { type MenuOptions } from "./options";

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export type MenuModel = {
  readonly id?: string | number;
  readonly icon?: IconProp | JSX.Element;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly iconSize?: IconSize;
  readonly label?: ReactNode;
  readonly href?: MenuItemHref;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isSelected?: boolean;
  readonly isDisabled?: boolean;
  readonly isVisible?: boolean;
  readonly drawer?: DrawerIdPropsPair;
  readonly actions?: Action[];
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: MenuItemInstance,
  ) => void;
  [key: string]: unknown;
};

export type ModelId<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly id: infer V extends NonNullable<MenuModel["id"]>;
}
  ? V
  : O extends { readonly getModelId: (m: M) => infer V extends NonNullable<MenuModel["id"]> }
    ? V
    : undefined;

export const getModelId = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelId<M, O> | undefined => {
  let v: string | number | Never = NEVER;
  if (options.getModelId !== undefined) {
    v = options.getModelId(model);
  } else if (model.id !== undefined) {
    v = model.id;
  }
  return v === NEVER ? undefined : (v as ModelId<M, O>);
};

export type ModelLabel<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly label: infer L extends ReactNode;
}
  ? L
  : O extends {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        readonly getModelLabel: (m: M, o: any) => infer L extends MenuModel["label"];
      }
    ? L
    : never;

export const getModelLabel = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelLabel<M, O> | undefined => {
  let v: ReactNode | Never = NEVER;
  if (options.getModelLabel !== undefined) {
    v = options.getModelLabel(model, {
      isMulti: options?.isMulti ?? false,
      isNullable: options?.isNullable ?? false,
    });
  } else if (model.label !== undefined) {
    v = model.label;
  }
  return v === NEVER ? undefined : (v as ModelLabel<M, O>);
};

export type ModelHref<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly href: infer L extends NonNullable<MenuModel["href"]>;
}
  ? L
  : O extends { readonly getModelHref: (m: M) => infer L extends NonNullable<MenuModel["href"]> }
    ? L
    : never;

export const getModelHref = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelHref<M, O> | undefined => {
  let v: NonNullable<MenuModel["href"]> | Never = NEVER;
  if (options.getModelHref !== undefined) {
    v = options.getModelHref(model);
  } else if (model.href !== undefined) {
    v = model.href;
  }
  return v === NEVER ? undefined : (v as ModelHref<M, O>);
};

export type ModelActions<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly actions: infer A extends NonNullable<MenuModel["actions"]>;
}
  ? A
  : O extends {
        readonly getModelActions: (m: M) => infer A extends NonNullable<MenuModel["actions"]>;
      }
    ? A
    : never;

export const getModelActions = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelActions<M, O> => {
  let v: Action[] | Never = NEVER;
  if (options.getModelActions !== undefined) {
    v = options.getModelActions(model);
  } else if (model.actions !== undefined) {
    v = model.actions;
  }
  if (v === NEVER) {
    return [] as Action[] as ModelActions<M, O>;
  }
  return v as ModelActions<M, O>;
};

export type ModelDrawer<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly drawer: infer Q extends NonNullable<MenuModel["drawer"]>;
}
  ? Q
  : O extends {
        readonly getModelDrawer: (m: M) => infer Q extends NonNullable<MenuModel["drawer"]>;
      }
    ? Q
    : never;

export const getModelDrawer = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelDrawer<M, O> | undefined => {
  let v: NonNullable<MenuModel["drawer"]> | Never = NEVER;
  if (options.getModelDrawer !== undefined) {
    v = options.getModelDrawer(model);
  } else if (model.drawer) {
    v = model.drawer;
  }
  return v === NEVER ? undefined : (v as ModelDrawer<M, O>);
};
