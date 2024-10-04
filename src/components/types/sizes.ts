export type SizeUnit = "px" | "rem" | "%";

export const isSizeUnit = (value: unknown): value is SizeUnit =>
  ["px", "rem", "%"].includes(value as string);

export type QualitativeSize = "fit-content";

const StringUnitlessSizeRegex = /^([0-9/.]*)$/;

export type StringUnitlessSize<T extends number = number> = `${T}`;

export const isStringUnitlessSize = (value: unknown): value is StringUnitlessSize => {
  if (typeof value === "string" && StringUnitlessSizeRegex.test(value)) {
    const v = parseInt(value);
    return !isNaN(v) && isFinite(v);
  }
  return false;
};

type ParsedStringUnitlessSize<O extends { strict?: boolean }> = O extends { strict: false }
  ? number | null
  : number;

export const parseStringUnitlessSize = <O extends { strict?: boolean }>(
  value: string,
  opts?: O,
): ParsedStringUnitlessSize<O> => {
  const executed = StringUnitlessSizeRegex.exec(value);
  if (executed) {
    const numeric = parseFloat(executed[1]);
    if (isNaN(numeric) || !isFinite(numeric)) {
      if (opts?.strict !== false) {
        throw new TypeError(`The provided size, '${value}', is invalid!`);
      }
      return null as ParsedStringUnitlessSize<O>;
    }
    return numeric;
  } else if (opts?.strict !== false) {
    throw new TypeError(`The provided size, '${value}', is invalid!`);
  }
  return null as ParsedStringUnitlessSize<O>;
};

export type UnitlessSize<T extends number = number> = T | StringUnitlessSize<T>;

export const isUnitlessSize = (value: unknown): value is UnitlessSize => {
  if (typeof value === "string") {
    return isStringUnitlessSize(value);
  }
  return typeof value === "number" && !isNaN(value) && isFinite(value);
};

export const isQualitativeSize = (value: unknown): value is QualitativeSize =>
  ["fit-content"].includes(value as string);

export type QuantitativeSizeString<
  U extends SizeUnit = SizeUnit,
  N extends UnitlessSize = UnitlessSize,
> = U extends SizeUnit ? `${N}${U}` : never;

export type QuantitativeSize<
  U extends SizeUnit = SizeUnit,
  N extends UnitlessSize = UnitlessSize,
> = U extends SizeUnit ? QuantitativeSizeString<U, N> | N : never;

const QuantitativeSizeRegex = /^([0-9]*)(px|rem|%)$/;

export const parseQuantitativeSizeString = (value: string): [number, SizeUnit] | [null, null] => {
  const executed = QuantitativeSizeRegex.exec(value);
  if (executed) {
    const sz = executed[1];
    const u = executed[2];
    const numeric = parseFloat(sz);
    if (isNaN(numeric) || !isFinite(numeric)) {
      return [null, null];
    } else if (typeof u !== "string") {
      return [null, null];
    } else if (!isSizeUnit(u)) {
      return [null, null];
    }
    return [numeric, u];
  }
  return [null, null];
};

type QuantitativeSizeTypeguardParams<U extends SizeUnit> = { readonly unit?: U };

export const isQuantitativeSizeString = <
  P extends QuantitativeSizeTypeguardParams<U>,
  U extends SizeUnit,
>(
  value: unknown,
  params: P,
): value is P extends { unit: U } ? QuantitativeSize<U> : QuantitativeSize => {
  if (typeof value === "string") {
    const [sz, u] = parseQuantitativeSizeString(value);
    if (sz !== null && u !== null) {
      return params.unit !== undefined ? u === params.unit : true;
    }
  }
  return false;
};

export const isQuantitativeSize = (value: unknown): value is QuantitativeSize =>
  isQuantitativeSizeString(value, {}) || isStringUnitlessSize(value) || typeof value === "number";

export const isQuantitativeSizeOfUnit = <U extends SizeUnit>(
  value: unknown,
  unit: U,
): value is QuantitativeSize<U> =>
  isQuantitativeSizeString(value, { unit }) ||
  isStringUnitlessSize(value) ||
  typeof value === "number";

export type InferQuantitativeSizeValue<T extends QuantitativeSize> =
  T extends `${infer N extends number}${SizeUnit}`
    ? N
    : T extends `${infer N extends number}`
      ? N
      : T extends number
        ? T
        : never;

export const inferQuantitativeSizeValue = <T extends QuantitativeSize>(
  value: T,
): InferQuantitativeSizeValue<T> => {
  if (typeof value === "number") {
    return value as InferQuantitativeSizeValue<T>;
  } else if (isStringUnitlessSize(value)) {
    const numeric = parseStringUnitlessSize(value);
    return numeric as InferQuantitativeSizeValue<T>;
  }
  const [sz] = parseQuantitativeSizeString(value);
  if (sz === null) {
    throw new TypeError(`The provided size, '${value}', is invalid!`);
  }
  return sz as InferQuantitativeSizeValue<T>;
};

export type Size<U extends SizeUnit = SizeUnit, N extends UnitlessSize = UnitlessSize> =
  | QuantitativeSize<U, N>
  | QualitativeSize;

type SizeToStringRT<
  T extends QuantitativeSize | UnitlessSize | QualitativeSize,
  U extends SizeUnit,
> = T extends UnitlessSize
  ? QuantitativeSizeString<U, InferQuantitativeSizeValue<T>>
  : T extends QuantitativeSizeString | QualitativeSize
    ? T
    : never;

export function sizeToString<
  T extends QuantitativeSize | UnitlessSize | QualitativeSize,
  U extends SizeUnit,
>(size: T, unit?: U): SizeToStringRT<T, U> {
  if (isQualitativeSize(size) || isQuantitativeSizeString(size, {})) {
    return size as SizeToStringRT<T, U>;
  } else if (unit === undefined) {
    throw new TypeError(
      "Invalid Function Implementation: The unit must be provided for numeric values.",
    );
  }
  return `${size}${unit}` as SizeToStringRT<T, U>;
}
