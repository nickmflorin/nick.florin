import { type MenuModel } from "./model";

export type MenuOptions<I extends MenuModel> = Partial<{
  readonly isMulti: boolean;
  readonly isNullable: boolean;
  readonly isDeselectable: boolean;
  readonly getModelValue: (m: I) => NonNullable<MenuModel["value"]>;
  readonly getModelLabel: (
    m: I,
    opts: { isMulti: boolean; isNullable: boolean },
  ) => MenuModel["label"];
  readonly getModelId: (m: I) => NonNullable<MenuModel["id"]>;
  readonly getModelHref: (m: I) => NonNullable<MenuModel["href"]>;
  readonly getModelActions: (m: I) => NonNullable<MenuModel["actions"]>;
  readonly getModelDrawer: (m: I) => NonNullable<MenuModel["drawer"]>;
}>;

export const menuIsNonNullable = <M extends MenuModel, O extends MenuOptions<M>>(options: O) =>
  options.isNullable === false && options.isMulti !== true;
