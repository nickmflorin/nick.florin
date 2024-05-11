import { type RefObject } from "react";

export type MenuItemKey = string | number;

export const getMenuItemKey = ({ id, index }: { index: number; id?: string }): MenuItemKey =>
  id !== undefined ? id : index;

export type MenuItemInstance = {
  readonly setLocked: (value: boolean) => void;
  readonly setDisabled: (value: boolean) => void;
  readonly setLoading: (value: boolean) => void;
};

export type MenuItemRefs = { [key in MenuItemKey]: RefObject<MenuItemInstance> };

export type MenuItemSelectionIndicator = "checkbox" | null;
export type MenuItemHref = string | { url: string; target?: string; rel?: string };
