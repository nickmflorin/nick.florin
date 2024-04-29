import clsx, { type ClassArray, type ClassValue } from "clsx";

export type ClassName = ClassValue | ClassArray;

const getClassNameParts = (cs: ClassName | undefined) =>
  clsx(cs)
    .split(" ")
    .map(c => c.trim());

const TailwindClassNameRegex = /^!?(([A-Za-z]+):)?([A-Za-z]+)-([A-Za-z0-9_\-\[\]]+)$/;

type ParseTailwindClassNameOptions = {
  readonly strict?: boolean;
};

export type ParsedTailwindClassName<T extends string | null = string> = {
  readonly modifier?: T;
  readonly prefix: T;
  readonly value: T;
  readonly original: string;
};

export type ParseTailwindClassNameRT<O extends ParseTailwindClassNameOptions> = O extends {
  strict: true;
}
  ? ParsedTailwindClassName
  : ParsedTailwindClassName | ParsedTailwindClassName<null>;

export const isTailwindClassName = (cs: string): boolean => TailwindClassNameRegex.test(cs);

export const parseTailwindClassName = <O extends ParseTailwindClassNameOptions>(
  original: string,
  opts: O,
): ParseTailwindClassNameRT<O> => {
  const match = TailwindClassNameRegex.exec(original);
  if (match) {
    const vs = [...match.values()];
    if (vs.length === 5) {
      return {
        original,
        modifier: vs[2],
        prefix: vs[3],
        value: vs[4],
      };
    }
    throw new Error(
      `The class name '${original}' is invalid, but somehow matched the regex.  Num matches: ${
        vs.length
      }, matches: ${JSON.stringify(vs)}.`,
    );
  } else if (opts.strict) {
    throw new Error(`The class name '${original}' is not a valid TailwindCSS class name!`);
  }
  return { prefix: null, value: null, original } as ParseTailwindClassNameRT<O>;
};

export const classNameContains = (
  className: ClassName | undefined,
  conditional: (v: ParsedTailwindClassName) => boolean,
): boolean =>
  getClassNameParts(className).some(c => {
    if (isTailwindClassName(c)) {
      return conditional(parseTailwindClassName(c, { strict: true }));
    }
    return false;
  });

export const classNameHasPrefix = (className: ClassName | undefined, prefix: string): boolean =>
  classNameContains(className, c => c.prefix === prefix);

export const findClassName = (
  className: ClassName,
  conditional: (v: ParsedTailwindClassName) => boolean,
): ParsedTailwindClassName | null => {
  const parts = getClassNameParts(className);
  const filtered = parts
    .map(p => parseTailwindClassName(p, { strict: false }))
    .filter(
      (parsed): parsed is ParsedTailwindClassName<string> =>
        parsed.prefix !== null && conditional(parsed),
    );
  return filtered.length === 0 ? null : filtered[filtered.length - 1];
};

export const withoutOverridingClassName = (overriding: string, cs: ClassName): string => {
  if (overriding.includes(" ")) {
    const parts = getClassNameParts(overriding);
    if (parts.length === 0) {
      return "";
    } else if (parts.length === 1) {
      return withoutOverridingClassName(parts[0], cs);
    }
    return clsx(
      withoutOverridingClassName(parts[0], cs),
      withoutOverridingClassName(clsx(parts.slice(1)), cs),
    );
  }
  const { prefix } = parseTailwindClassName(overriding, { strict: true });
  return clsx({ [overriding]: !classNameHasPrefix(cs, prefix) });
};

export const mergeIntoClassNames = (base: ClassName, override: ClassName): string =>
  clsx(
    // Only include the class names from the base set that are not overridden by the override set.
    ...getClassNameParts(base).filter(pt =>
      getClassNameParts(override).some(ov => {
        const { prefix } = parseTailwindClassName(ov, { strict: false });
        if (!prefix) {
          return true;
        }
        return !classNameHasPrefix(pt, prefix);
      }),
    ),
    override,
  );
