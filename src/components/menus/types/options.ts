import { type ReactNode } from "react";

import { type MenuModel } from "./model";

export type ItemQueryOption = {
  params: Record<string, string>;
  clear?: string[] | string | true;
};

export type MenuOptions<I extends MenuModel> = Partial<{
  readonly isMulti: boolean;
  readonly isNullable: boolean;
  readonly getItemValue: (m: I) => unknown;
  readonly getItemLabel: (m: I) => ReactNode;
  // TODO: We may want to move this to the Select since it is not applicable to the generic Menu.
  readonly getItemValueLabel: (m: I) => ReactNode;
  readonly getItemId: (m: I) => string | number;
  readonly getItemHref: (m: I) => string;
  readonly getItemQuery: (m: I) => ItemQueryOption;
}>;

export const menuIsNonNullable = <M extends MenuModel, O extends MenuOptions<M>>(options: O) =>
  options.isNullable === false && options.isMulti !== true;
