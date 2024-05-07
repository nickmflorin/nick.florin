import { type SelectModelValue, type SelectModel, type AllowedSelectModelValue } from "./model";
import { type SelectOptions } from "./options";

export type SelectValue<M extends SelectModel, O extends SelectOptions<M>> = O extends {
  isMulti: true;
}
  ? SelectModelValue<M, O>[]
  : O extends { isNullable: true }
    ? SelectModelValue<M, O> | null
    : SelectModelValue<M, O>;

export type AnySelectValue<M extends SelectModel, O extends SelectOptions<M>> =
  | SelectModelValue<M, O>[]
  | null
  | SelectModelValue<M, O>;

export type SelectModeledValue<M extends SelectModel, O extends SelectOptions<M>> = O extends {
  isMulti: true;
}
  ? M[]
  : O extends { isNullable: true }
    ? M | null
    : M;

export type SelectIsValued<M extends SelectModel, O extends SelectOptions<M>> = M extends {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  readonly value: infer V extends AllowedSelectModelValue;
}
  ? true
  : /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    O extends { readonly getModelValue: (m: M) => infer V extends AllowedSelectModelValue }
    ? true
    : false;

export type IfSelectValued<T, M extends SelectModel, O extends SelectOptions<M>, F = never> =
  SelectIsValued<M, O> extends true ? T : F;

export const selectIsValued = <M extends SelectModel, O extends SelectOptions<M>>(
  data: M[],
  options: O,
): SelectIsValued<M, O> =>
  (data.some(m => m.value !== undefined) || options.getModelValue !== undefined) as SelectIsValued<
    M,
    O
  >;
