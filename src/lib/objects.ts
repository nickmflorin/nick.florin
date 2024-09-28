export type IterablePathObj<V> = { [key in string]: V | IterablePathObj<V> };

type ContinueOn<V> = (v: IterablePathObj<V> | V) => v is IterablePathObj<V>;

type IterablePathOptions<V> = {
  readonly continueOn: ContinueOn<V>;
};

export function* iteratePaths<V>(
  obj: IterablePathObj<V>,
  options: IterablePathOptions<V>,
): IterableIterator<string[]> {
  const entries = Object.entries(obj);
  if (entries.length == 0) {
    return yield [];
  }
  for (const [key, value] of entries) {
    if (!options.continueOn(value)) {
      yield [key];
    } else if (typeof value === "object" && value !== null) {
      for (const path of iteratePaths(value, options)) {
        yield [key, ...path];
      }
    }
  }
}

type ParseValueAtPathOptions<V> = {
  readonly path: string[];
  readonly continueOn: ContinueOn<V>;
};

export const parseValueAtPath = <V>(
  obj: IterablePathObj<V>,
  { path, continueOn }: ParseValueAtPathOptions<V>,
): V => {
  if (path.length === 0) {
    throw new Error("The path must be at least 1 element!");
  }
  let runningObj: IterablePathObj<V> = obj;
  let runningPath = [...path];
  while (runningPath.length > 0) {
    const segment = runningPath[0];
    const running = runningObj[segment];
    if (continueOn(running)) {
      if (runningPath.length === 0) {
        throw new Error(
          "The 'continueOn' option method unexpectedly indicated that the lowest level " +
            "value has not yet been reached even though the path has been fully traversed.",
        );
      }
      runningPath = runningPath.slice(1);
      runningObj = running;
    } else {
      return running;
    }
  }
  throw new Error("The path has been fully traversed before reaching a final value!");
};

type FlattenObjectPathsOptions<V> = {
  readonly formatter: (path: string[]) => string;
  readonly continueOn: ContinueOn<V>;
};

type FlattenedObjPaths<V> = {
  [key in string]: V;
};

export const flattenObjectPaths = <V>(
  obj: IterablePathObj<V>,
  options: FlattenObjectPathsOptions<V>,
) => {
  if (Object.keys(obj).length === 0) {
    return {} as FlattenedObjPaths<V>;
  }
  const paths = Array.from(iteratePaths(obj, options));
  return paths.reduce(
    (prev: FlattenedObjPaths<V>, path: string[]) => ({
      ...prev,
      [options.formatter(path)]: parseValueAtPath(obj, { ...options, path }),
    }),
    {} as FlattenedObjPaths<V>,
  );
};
