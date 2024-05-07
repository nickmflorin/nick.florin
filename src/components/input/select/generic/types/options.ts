import { type MenuOptions } from "~/components/menus";

import { type SelectModel } from "./model";

export type SelectOptions<I extends SelectModel> = MenuOptions<I> &
  Partial<{
    readonly getModelValue: (m: I) => NonNullable<SelectModel["value"]>;
    readonly getModelValueLabel: (
      m: I,
      opts: { isMulti: boolean; isNullable: boolean },
    ) => SelectModel["valueLabel"];
  }>;

export type IsEqual<A, B> = [A] extends [B] ? true : false;

export type IfSelectFiltered<T, O extends { isFiltered?: boolean; isMulti?: boolean }, F = never> =
  IsEqual<[O["isFiltered"], O["isMulti"]], [true, true]> extends true ? T : F;

export const selectIsFiltered = <M extends SelectModel>(options: SelectOptions<M>): boolean =>
  Boolean(options.isFiltered && options.isMulti);
