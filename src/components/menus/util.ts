import * as types from "./types";

export type MenuItemKey = string | number;

export const getMenuItemKey = <M extends types.MenuModel, O extends types.MenuOptions<M>>({
  value,
  id,
  index,
}: {
  value: types.ModelValue<M, O> | types.ValueNotApplicable;
  index: number;
  id: types.ModelId<M, O>;
}): MenuItemKey =>
  (typeof value === "string" || typeof value === "number") && value !== types.VALUE_NOT_APPLICABLE
    ? value
    : id !== undefined
      ? id
      : index;
