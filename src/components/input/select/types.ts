import { type ReactNode } from "react";

import {
  type MenuModel,
  type MenuModelValue,
  type MenuOptions,
  type MenuValue,
} from "~/components/menus";

export type SelectInstance<M extends MenuModel, O extends MenuOptions<M>> = {
  readonly value: MenuValue<M, O>;
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
  readonly setValue: (v: MenuValue<M, O>) => void;
};

export type SelectValueRenderer<M extends MenuModel, O extends MenuOptions<M>> = (
  v: MenuValue<M, O>,
  params: { models: MenuModelValue<M, O>; instance: SelectInstance<M, O> },
) => ReactNode;

export type SelectValueModelRenderer<M extends MenuModel, O extends MenuOptions<M>> = (
  v: MenuValue<M, O>,
  params: { model: M; instance: SelectInstance<M, O> },
) => ReactNode;

export type SelectItemRenderer<M extends MenuModel> = (model: M) => ReactNode;

export interface MultiValueRendererProps<M extends MenuModel, O extends MenuOptions<M>> {
  readonly models: M[];
  readonly maximumNumBadges?: number;
  readonly options: O;
  readonly value: MenuValue<M, O>;
  readonly selectInstance: SelectInstance<M, O>;
  readonly valueModelRenderer?: SelectValueModelRenderer<M, O>;
}

export type MultiValueRendererCompoennt = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MultiValueRendererProps<M, O>,
  ): JSX.Element;
};
