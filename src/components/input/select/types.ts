import { type ReactNode } from "react";

import {
  type MenuModel,
  type MenuOptions,
  type MenuValue,
  type AllowedMenuModelValue,
  type MenuModeledValue,
  type MenuModelValue,
} from "~/components/menus";

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export type SelectModelValue<
  M extends SelectModel,
  O extends SelectOptions<M>,
  D extends SelectDataOptions<M, O>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
> = D extends { valueData: (infer T extends { value: any })[] }
  ? T extends { value: infer V extends MenuModelValue<M, O> }
    ? V
    : never
  : MenuModelValue<M, O>;

export type SelectModeledValue<
  M extends SelectModel,
  O extends SelectOptions<M>,
  D extends SelectDataOptions<M, O>,
> = D extends { valueData: (infer T extends SelectValueDatum<M, O>)[] }
  ? O extends {
      isMulti: true;
    }
    ? T[]
    : O extends { isNullable: true }
      ? T | null
      : T
  : MenuModeledValue<M, O>;

export type SelectValue<
  M extends MenuModel,
  O extends MenuOptions<M>,
  D extends SelectDataOptions<M, O>,
> = O extends { isMulti: true }
  ? SelectModelValue<M, O, D>[]
  : O extends { isNullable: true }
    ? SelectModelValue<M, O, D> | null
    : SelectModelValue<M, O, D>;

export type SelectModel<V extends AllowedMenuModelValue = AllowedMenuModelValue> = MenuModel<V> & {
  /* The element that will be used to communicate the label representation of the Select's value
     in the Select's rendered input. */
  readonly valueLabel?: ReactNode;
};

export type SelectValueDatum<M extends SelectModel, O extends SelectOptions<M>> = {
  readonly value: MenuModelValue<M, O>;
  readonly label: ReactNode;
};

export type SelectOptions<M extends SelectModel> = MenuOptions<M> &
  Partial<{
    readonly getModelValueLabel: (
      m: M,
      opts: { isMulti: boolean; isNullable: boolean },
    ) => SelectModel["valueLabel"];
  }>;

export type SelectDataOptions<M extends SelectModel, O extends SelectOptions<M>> = Partial<{
  readonly valueData?: SelectValueDatum<M, O>[];
}>;

export type SelectInstance = {
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectValueRenderer<
  M extends SelectModel,
  O extends SelectOptions<M>,
  P extends { models: MenuModeledValue<M, O> } = {
    models: MenuModeledValue<M, O>;
    select: SelectInstance;
  },
> = (v: MenuValue<M, O>, params: P) => ReactNode;

export type SelectValueModelRenderer<
  M extends SelectModel,
  O extends SelectOptions<M>,
  P extends { model: M } = { model: M; select: SelectInstance },
> = (v: MenuValue<M, O>, params: P) => ReactNode;

export type SelectItemRenderer<M extends SelectModel> = (model: M) => ReactNode;

export interface MultiValueRendererProps<M extends SelectModel, O extends SelectOptions<M>> {
  readonly models: M[];
  readonly maximumNumBadges?: number;
  readonly options: O;
  readonly value: MenuValue<M, O>;
  readonly dynamicHeight?: boolean;
  readonly valueModelRenderer?: SelectValueModelRenderer<M, O, { model: M }>;
}

export type MultiValueRendererCompoennt = {
  <M extends SelectModel, O extends SelectOptions<M>>(
    props: MultiValueRendererProps<M, O>,
  ): JSX.Element;
};

export type ModelValueLabel<M extends SelectModel, O extends SelectOptions<M>> = M extends {
  readonly valueLabel: infer L extends ReactNode;
}
  ? L
  : O extends {
        readonly getModelValueLabel: (
          m: M,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          o: any,
        ) => infer L extends ReactNode;
      }
    ? L
    : undefined;

export const getModelValueLabel = <M extends SelectModel, O extends SelectOptions<M>>(
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
