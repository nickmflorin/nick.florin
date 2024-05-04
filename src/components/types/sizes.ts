export type SizeUnit = "px" | "rem";

export type QualitativeSize = "fit-content";

export type QuantitativeSizeString<
  U extends SizeUnit = SizeUnit,
  T extends number = number,
> = `${T}${U}`;

export type QuantitativeSize<U extends SizeUnit = SizeUnit> = QuantitativeSizeString<U> | number;
export type SizeString<U extends SizeUnit = SizeUnit> = QuantitativeSizeString<U> | QualitativeSize;

export type Size<U extends SizeUnit = SizeUnit> = QuantitativeSize<U> | QualitativeSize;

const QuantitativeSizeRegex = /^([0-9]*)(px|rem)$/;

type SizeToStringRT<
  T extends QuantitativeSizeString | QualitativeSize | number,
  U extends SizeUnit,
> = T extends number ? `${T}${U}` : T;

export function sizeToString<
  T extends QuantitativeSizeString | QualitativeSize | number,
  U extends SizeUnit,
>(size: T, unit: U): SizeToStringRT<T, U> {
  if (typeof size === "string") {
    return size as SizeToStringRT<T, U>;
  } else if (unit === undefined) {
    throw new TypeError(
      "Invalid Function Implementation: The unit must be provided for numeric values.",
    );
  }
  return `${size}${unit}` as SizeToStringRT<T, U>;
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
