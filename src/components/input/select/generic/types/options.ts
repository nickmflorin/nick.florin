import { type MenuOptions } from "~/components/menus";

import { type AllowedSelectModelValue, type SelectModel } from "./model";

export type SelectOptions<
  V extends AllowedSelectModelValue,
  M extends SelectModel<V>,
> = MenuOptions<M> &
  Partial<{
    readonly isValueModeled?: boolean;
    readonly getModelValue: (m: M) => V;
    readonly getModelValueLabel: (
      m: M,
      opts: { isMulti: boolean; isNullable: boolean },
    ) => SelectModel<V>["valueLabel"];
  }>;
