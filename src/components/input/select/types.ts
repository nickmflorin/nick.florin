import { type MenuModel, type MenuOptions, type MenuValue } from "~/components/menus";

export type SelectInstance<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly value: MenuValue<M, O>;
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
  readonly setValue: (v: MenuValue<M, O>) => void;
};
