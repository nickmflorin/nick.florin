import { type ReactNode } from "react";

import {
  type MenuModel,
  type MenuOptions,
  type MenuValue,
  type AllowedMenuModelValue,
  type MenuModelValue,
} from "~/components/menus";

const NEVER = "__NEVER__" as const;
type Never = typeof NEVER;

export type SelectModel<V extends AllowedMenuModelValue = AllowedMenuModelValue> = MenuModel<V> & {
  // The element that will be used to communicate the value of the select in the select input.
  readonly valueLabel?: ReactNode;
};

export type SelectOptions<I extends SelectModel> = MenuOptions<I> &
  Partial<{
    readonly getModelValueLabel: (
      m: I,
      opts: { isMulti: boolean; isNullable: boolean },
    ) => SelectModel["valueLabel"];
  }>;

export type SelectInstance = {
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectValueRenderer<
  M extends SelectModel,
  O extends SelectOptions<M>,
  P extends { models: MenuModelValue<M, O> } = {
    models: MenuModelValue<M, O>;
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
