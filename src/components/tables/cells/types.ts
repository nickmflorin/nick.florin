import type * as types from "../types";

export interface EditableStringCellProps<
  M extends { id: string } & { [key in K]: string | null },
  K extends keyof M,
  P extends { [key in K]: string },
> {
  readonly model: M;
  readonly field: K;
  readonly table: types.TableInstance<M>;
  readonly errorMessage: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (data: P) => Promise<any>;
}

export type EditableStringCellComponent = {
  <
    M extends { id: string } & { [key in K]: string | null },
    K extends keyof M,
    P extends { [key in K]: string },
  >(
    props: EditableStringCellProps<M, K, P>,
  ): JSX.Element;
};

export interface VisibleCellProps<M extends { id: string; visible: boolean }> {
  readonly model: M;
  readonly table: types.TableInstance<M>;
  readonly errorMessage: string;
  readonly action: (id: string, data: { visible: boolean }) => Promise<void>;
}

export type VisibleCellComponent = {
  <M extends { id: string; visible: boolean }>(props: VisibleCellProps<M>): JSX.Element;
};
