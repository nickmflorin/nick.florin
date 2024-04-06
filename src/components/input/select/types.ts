import { type ReactNode } from "react";

import {
  type MenuModel,
  type MenuOptions,
  type MenuValue,
  type MenuModelValue,
} from "~/components/menus";

export type SelectInstance = {
  readonly setOpen: (v: boolean) => void;
  readonly setLoading: (v: boolean) => void;
};

export type SelectValueRenderer<
  M extends MenuModel,
  O extends MenuOptions<M>,
  P extends { models: MenuModelValue<M, O> } = {
    models: MenuModelValue<M, O>;
    select: SelectInstance;
  },
> = (v: MenuValue<M, O>, params: P) => ReactNode;

export type SelectValueModelRenderer<
  M extends MenuModel,
  O extends MenuOptions<M>,
  P extends { model: M } = { model: M; select: SelectInstance },
> = (v: MenuValue<M, O>, params: P) => ReactNode;

export type SelectItemRenderer<M extends MenuModel> = (model: M) => ReactNode;

export interface MultiValueRendererProps<M extends MenuModel, O extends MenuOptions<M>> {
  readonly models: M[];
  readonly maximumNumBadges?: number;
  readonly options: O;
  readonly value: MenuValue<M, O>;
  readonly valueModelRenderer?: SelectValueModelRenderer<M, O, { model: M }>;
}

export type MultiValueRendererCompoennt = {
  <M extends MenuModel, O extends MenuOptions<M>>(
    props: MultiValueRendererProps<M, O>,
  ): JSX.Element;
};
