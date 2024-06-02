import type { ApiClientErrorJson } from "~/api";
import type * as types from "~/components/tables/types";

export interface EditableStringCellProps<
  M extends { id: string } & { [key in K]: string | null },
  K extends keyof M,
  P extends { [key in K]: string },
  T,
> {
  readonly model: M;
  readonly field: K;
  readonly table: types.CellTableInstance<M>;
  readonly errorMessage: string;
  readonly action: (data: P) => Promise<T | ApiClientErrorJson>;
}

export type EditableStringCellComponent = {
  <
    M extends { id: string } & { [key in K]: string | null },
    K extends keyof M,
    P extends { [key in K]: string },
    T,
  >(
    props: EditableStringCellProps<M, K, P, T>,
  ): JSX.Element;
};

export interface VisibleCellProps<M extends { id: string; visible: boolean }, T> {
  readonly model: M;
  readonly table: types.CellTableInstance<M>;
  readonly errorMessage: string;
  readonly action: (id: string, data: { visible: boolean }) => Promise<T | ApiClientErrorJson>;
}

export type VisibleCellComponent = {
  <M extends { id: string; visible: boolean }, T>(props: VisibleCellProps<M, T>): JSX.Element;
};

export interface HighlightedCellProps<M extends { id: string; highlighted: boolean }, T> {
  readonly model: M;
  readonly table: types.CellTableInstance<M>;
  readonly errorMessage: string;
  readonly action: (id: string, data: { highlighted: boolean }) => Promise<T | ApiClientErrorJson>;
}

export type HighlightedCellComponent = {
  <M extends { id: string; highlighted: boolean }, T>(
    props: HighlightedCellProps<M, T>,
  ): JSX.Element;
};
