import { type ReactNode } from "react";

import { type MenuModel } from "./model";

export type MenuOptions<I extends MenuModel> = Partial<{
  readonly isMulti: boolean;
  readonly isNullable: boolean;
  readonly getItemValue: (m: I) => unknown;
  readonly getItemLabel: (m: I) => ReactNode;
  readonly getItemId: (m: I) => string | number;
}>;

export const menuIsNonNullable = <M extends MenuModel, O extends MenuOptions<M>>(options: O) =>
  options.isNullable === false && options.isMulti !== true;
