import { isEqual } from "lodash-es";

export const uniq = <T>(a: T[], equality?: (a: T, b: T) => boolean): T[] => {
  const eq = equality ?? isEqual;
  return a.reduce((prev: T[], curr: T) => {
    if (!prev.some(v => eq(v, curr))) {
      return [...prev, curr];
    }
    return prev;
  }, [] as T[]);
};

export const arraysHaveSameElements = <T>(
  a: T[],
  b: T[],
  equality?: (a: T, b: T) => boolean,
): boolean => {
  const eq = equality ?? isEqual;

  const uniques: [T[], T[]] = [uniq(a, eq), uniq(b, eq)];
  if (uniques[0].length !== a.length || uniques[1].length !== b.length) {
    throw new Error("The provided arrays must contain only unique elements.");
  }
  return (
    uniques[0].length === uniques[1].length &&
    uniques[0].every(v => uniques[1].some(vi => eq(v, vi)))
  );
};

type StrictArrayLookupOptions = {
  readonly strict?: boolean;
};

type StrictArrayLookupRT<T, O extends StrictArrayLookupOptions> = O extends { strict: true }
  ? T
  : T | null;

export const strictArrayLookup = <T, O extends StrictArrayLookupOptions>(
  arr: T[],
  index: number,
  options: O,
): StrictArrayLookupRT<T, O> => {
  const result = arr[index];
  if (result === undefined) {
    if (options.strict === true) {
      throw new Error(`Array index ${index} is out of bounds.`);
    }
    return null as StrictArrayLookupRT<T, O>;
  }
  return result;
};

export function* cycle<T>(data: T[]): Generator<T, T, T> {
  let index = 0;
  while (true) {
    if (index === data.length) {
      index = 0;
    }
    yield data[index];
    index += 1;
  }
}

export function* tupleCycle<T, R>(primary: T[], secondary: R[]): Generator<[T, R], [T, R], [T, R]> {
  let indices: [number, number] = [0, 0];
  while (true) {
    if (indices[0] === primary.length) {
      indices = [0, indices[1]];
    }
    const prim = primary[indices[0]];
    if (indices[1] === secondary.length) {
      indices = [indices[0], 0];
    }
    while (indices[1] < secondary.length) {
      yield [prim, secondary[indices[1]]];
      indices[1] += 1;
    }
    indices[0] += 1;
  }
}
