export type SizeUnit = "px" | "rem" | "%";

export type QualitativeSize = "fit-content";

export type QuantitativeSizeString<
  U extends SizeUnit = SizeUnit,
  N extends number = number,
> = `${N}${U}`;

export type QuantitativeSize<U extends SizeUnit = SizeUnit, N extends number = number> =
  | QuantitativeSizeString<U, N>
  | N;

export type SizeString<U extends SizeUnit = SizeUnit, N extends number = number> =
  | QuantitativeSizeString<U, N>
  | QualitativeSize;

export type Size<U extends SizeUnit = SizeUnit, N extends number = number> =
  | QuantitativeSize<U, N>
  | QualitativeSize;

const QuantitativeSizeRegex = /^([0-9]*)(px|rem|%)$/;

export function sizeToString<U extends SizeUnit = SizeUnit, N extends number = number>(
  size: Size<U, N>,
  unit: U,
): QuantitativeSizeString<U, N>;

export function sizeToString<U extends SizeUnit = SizeUnit, N extends number = number>(
  size: QuantitativeSizeString<U, N>,
  unit?: U,
): QuantitativeSizeString<U, N>;

export function sizeToString<U extends SizeUnit = SizeUnit, N extends number = number>(
  size: N,
  unit: U,
): QuantitativeSizeString<U, N>;

export function sizeToString<U extends SizeUnit = SizeUnit, N extends number = number>(
  size: QuantitativeSize<U, N>,
  unit: U,
): QuantitativeSizeString<U, N>;

export function sizeToString<U extends SizeUnit = SizeUnit, N extends number = number>(
  size: N | QuantitativeSizeString<U, N> | QuantitativeSize<U, N> | Size<U, N>,
  unit?: U,
) {
  if (typeof size === "string") {
    return size;
  } else if (unit === undefined) {
    throw new TypeError(
      "Invalid Function Implementation: The unit must be provided for numeric values.",
    );
  }
  return `${size}${unit}`;
}

type SizeToNumberRT<T extends QuantitativeSize> = T extends `${infer N extends number}${SizeUnit}`
  ? N
  : T;

export const sizeToNumber = <T extends QuantitativeSize>(size: T): SizeToNumberRT<T> => {
  if (typeof size === "number") {
    return size as SizeToNumberRT<T>;
  }
  const executed = QuantitativeSizeRegex.exec(size);
  if (executed) {
    const sz = executed[1];
    const integer = parseInt(sz);
    if (isNaN(integer) || !isFinite(integer)) {
      throw new TypeError(`The provided size string, '${size}', is invalid!`);
    }
    return integer as SizeToNumberRT<T>;
  }
  throw new TypeError(`The provided size string, '${size}', is invalid!`);
};
