import { type ReactNode } from "react";

import { type z } from "zod";

import { type Action } from "~/components/structural";

import { type MenuModel, type MenuModelParamsSchema } from "./model";

export type MenuOptions<I extends MenuModel> = Partial<{
  readonly isMulti: boolean;
  readonly isNullable: boolean;
  readonly getItemValue: (m: I) => unknown;
  readonly getItemLabel: (m: I, opts: MenuOptions<I>) => ReactNode;
  // TODO: We may want to move this to the Select since it is not applicable to the generic Menu.
  readonly getItemValueLabel: (m: I, opts: MenuOptions<I>) => ReactNode;
  readonly getItemId: (m: I) => string | number;
  readonly getItemHref: (m: I) => string;
  readonly getItemActions: (m: I) => Action[];
  readonly getItemQuery: (m: I) => z.infer<typeof MenuModelParamsSchema>["query"];
}>;

export const menuIsNonNullable = <M extends MenuModel, O extends MenuOptions<M>>(options: O) =>
  options.isNullable === false && options.isMulti !== true;
