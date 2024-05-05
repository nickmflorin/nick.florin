import { type RefObject } from "react";

import {
  type MenuModel,
  type MenuModelValue,
  type ModelId,
  type ValueNotApplicable,
  VALUE_NOT_APPLICABLE,
} from "./model";
import { type MenuOptions } from "./options";

export type MenuItemKey = string | number;

export const getMenuItemKey = <M extends MenuModel, O extends MenuOptions<M>>({
  value,
  id,
  index,
}: {
  value: MenuModelValue<M, O> | ValueNotApplicable;
  index: number;
  id: ModelId<M, O>;
}): MenuItemKey =>
  (typeof value === "string" || typeof value === "number") && value !== VALUE_NOT_APPLICABLE
    ? value
    : id !== undefined
      ? id
      : index;

export type MenuItemInstance = {
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};

export type MenuItemRefs = { [key in MenuItemKey]: RefObject<MenuItemInstance> };
