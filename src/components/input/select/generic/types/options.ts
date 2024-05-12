import { type ReactNode } from "react";

import { type MenuOptions } from "~/components/menus";

import { type AllowedSelectModelValue, type SelectModel } from "./model";

export type SelectOptions<M extends SelectModel> = MenuOptions<M> &
  Partial<{
    readonly isClearable?: boolean;
    readonly isValueModeled?: boolean;
    readonly getModelValue: (m: M) => AllowedSelectModelValue;
    readonly getModelValueLabel: (
      m: M,
      opts: { isMulti: boolean; isNullable: boolean },
    ) => ReactNode;
  }>;
