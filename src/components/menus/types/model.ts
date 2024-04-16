import { type ReactNode } from "react";

import { z } from "zod";

import { DrawerIds } from "~/components/drawers";
import { type IconProp, type IconSize } from "~/components/icons";
import { type Action } from "~/components/structural";
import { type ComponentProps } from "~/components/types";

import { type MenuItemInstance } from "./item";
import { type MenuOptions } from "./options";

export const VALUE_NOT_APPLICABLE = "__VALUE_NOT_APPLICABLE__";
export type ValueNotApplicable = typeof VALUE_NOT_APPLICABLE;

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export const QuerySchema = z.object({
  params: z.record(z.string()),
  clear: z.union([z.string(), z.literal(true), z.array(z.string())]).optional(),
});

export const DrawerQuerySchema = z.object({
  drawerId: DrawerIds.schema,
  props: z.record(z.string()),
});

export type AllowedMenuModelValue = string | number | Record<string, unknown>;

export type MenuModelHref = string | { url: string; target?: string; rel?: string };

export type MenuModel<V extends AllowedMenuModelValue = AllowedMenuModelValue> = {
  readonly id?: string | number;
  readonly icon?: IconProp | JSX.Element;
  readonly iconClassName?: ComponentProps["className"];
  readonly spinnerClassName?: ComponentProps["className"];
  readonly iconSize?: IconSize;
  readonly label?: ReactNode;
  readonly valueLabel?: ReactNode;
  readonly href?: MenuModelHref;
  readonly isLocked?: boolean;
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
  readonly isVisible?: boolean;
  readonly query?: z.infer<typeof QuerySchema> | z.infer<typeof DrawerQuerySchema>;
  readonly actions?: Action[];
  readonly value?: V;
  readonly onClick?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    instance: MenuItemInstance,
  ) => void;
  [key: string]: unknown;
};

export type ModelValue<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly value: infer V;
}
  ? V
  : O extends { readonly getModelValue: (m: M) => infer V }
    ? V
    : never;

export const getModelValue = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelValue<M, O> | ValueNotApplicable => {
  let v: unknown = VALUE_NOT_APPLICABLE;
  if (options.getModelValue !== undefined) {
    v = options.getModelValue(model);
  } else if (model.value !== undefined) {
    v = model.value;
  }
  return v as ModelValue<M, O>;
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

export type ModelQuery<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly query: infer Q extends NonNullable<MenuModel["query"]>;
}
  ? Q
  : O extends {
        readonly getModelQuery: (m: M) => infer Q extends NonNullable<MenuModel["query"]>;
      }
    ? Q
    : never;

export const getModelQuery = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelQuery<M, O> | undefined => {
  let v: NonNullable<MenuModel["query"]> | Never = NEVER;
  if (options.getModelQuery !== undefined) {
    v = options.getModelQuery(model);
  } else if (model.query) {
    v = model.query;
  }
  return v === NEVER ? undefined : (v as ModelQuery<M, O>);
};

export type ModelValueLabel<M extends MenuModel, O extends MenuOptions<M>> = M extends {
  readonly valueLabel: infer L extends MenuModel["valueLabel"];
}
  ? L
  : O extends {
        readonly getModelValueLabel: (
          m: M,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          o: any,
        ) => infer L extends MenuModel["valueLabel"];
      }
    ? L
    : undefined;

export const getModelValueLabel = <M extends MenuModel, O extends MenuOptions<M>>(
  model: M,
  options: O,
): ModelValueLabel<M, O> | undefined => {
  let v: ReactNode | Never = NEVER;
  if (options.getModelValueLabel !== undefined) {
    v = options.getModelValueLabel(model, {
      isMulti: options?.isMulti ?? false,
      isNullable: options?.isNullable ?? false,
    });
  } else if (model.valueLabel !== undefined) {
    v = model.valueLabel;
  }
  return v === NEVER ? undefined : (v as ModelValueLabel<M, O>);
};
