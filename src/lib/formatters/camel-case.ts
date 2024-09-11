import { camelCase } from "lodash-es";

export type SnakeCaseToCamelCase<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${SnakeCaseToCamelCase<P3>}`
  : Lowercase<S>;

export const snakeCaseToCamelCase = <S extends string>(value: S): SnakeCaseToCamelCase<S> =>
  camelCase(value) as SnakeCaseToCamelCase<S>;
