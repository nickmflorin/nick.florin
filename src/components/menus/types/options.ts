import { type MenuModel } from "./model";

export type MenuOptions<I extends MenuModel> = Partial<{
  readonly isMulti: boolean;
  readonly isNullable: boolean;
  readonly getModelValue: (m: I) => NonNullable<MenuModel["value"]>;
  readonly getModelLabel: (
    m: I,
    opts: { isMulti: boolean; isNullable: boolean },
  ) => MenuModel["label"];
  // TODO: We may want to move this to the Select since it is not applicable to the generic Menu.
  readonly getModelValueLabel: (
    m: I,
    opts: { isMulti: boolean; isNullable: boolean },
  ) => MenuModel["valueLabel"];
  readonly getModelId: (m: I) => NonNullable<MenuModel["id"]>;
  readonly getModelHref: (m: I) => NonNullable<MenuModel["href"]>;
  readonly getModelActions: (m: I) => NonNullable<MenuModel["actions"]>;
  readonly getModelQuery: (m: I) => NonNullable<MenuModel["query"]>;
}>;

export const menuIsNonNullable = <M extends MenuModel, O extends MenuOptions<M>>(options: O) =>
  options.isNullable === false && options.isMulti !== true;
