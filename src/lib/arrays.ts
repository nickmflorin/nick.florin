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
