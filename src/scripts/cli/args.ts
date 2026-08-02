import * as errors from './errors';

const splitCliNamedArgument = (name: string, value: string) => {
  if (!value.includes('=')) {
    throw new errors.InvalidCommandLineArgumentError(
      name,
      value,
      'The named argument must define a value!',
    );
  }
  const parsed = value.split('=')[1];
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Indexed access is
     typed as non-nullable, but the element is absent when the value has no assignment. */
  if (parsed === undefined) {
    throw new errors.InvalidCommandLineArgumentError(
      name,
      value,
      'The named argument must define a value!',
    );
  }
  return parsed.trim();
};

export const getPositionalArgument = (index: number): string | undefined => {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      return undefined;
    } else if (i === index) {
      return arg;
    }
  }
  return undefined;
};

type CliPrimitive = boolean | number | string;

type NamedArgumentParser<V extends CliPrimitive> = (value: string) => V;

interface GetNamedArgumentOptions<V extends CliPrimitive = CliPrimitive> {
  readonly defaultValue: V;
  readonly parser: NamedArgumentParser<V>;
  readonly required?: boolean;
}

type VOrUndefined<T, O extends Partial<GetNamedArgumentOptions>> = O extends { required: true }
  ? T
  : T | undefined;

type NamedArgumentRT<O extends Partial<GetNamedArgumentOptions>> =
  O extends GetNamedArgumentOptions<infer V extends CliPrimitive>
    ? V
    : O extends { defaultValue: infer D extends CliPrimitive }
      ? D | string
      : O extends { parser: NamedArgumentParser<infer V extends CliPrimitive> }
        ? VOrUndefined<V, O>
        : VOrUndefined<string, O>;

export const getNamedArgument = <O extends Partial<GetNamedArgumentOptions>>(
  name: string,
  options: O,
): NamedArgumentRT<O> => {
  const value = process.argv.slice(2).find(arg => arg.startsWith(`--${name}`));
  if (value === undefined) {
    if (options.defaultValue !== undefined) {
      return options.defaultValue as NamedArgumentRT<O>;
    }
    return value as NamedArgumentRT<O>;
  } else if (!value.includes('=')) {
    throw new errors.InvalidCommandLineArgumentError(
      name,
      value,
      'The named argument must define a value!',
    );
  }
  const parsed = splitCliNamedArgument(name, value);
  if (options.parser) {
    return options.parser(parsed) as NamedArgumentRT<O>;
  }
  return parsed as NamedArgumentRT<O>;
};

type GetBooleanCliArgumentOptions = {
  readonly defaultValue?: boolean;
  readonly required?: boolean;
};

export const getBooleanCliArgument = <O extends GetBooleanCliArgumentOptions>(
  name: string,
  options: O,
): NamedArgumentRT<
  {
    parser: (v: string) => boolean;
  } & O
> =>
  getNamedArgument<{ parser: (v: string) => boolean } & O>(name, {
    ...options,
    parser: value => {
      if (!['false', 'true'].includes(value.trim().toLowerCase())) {
        throw new errors.InvalidCommandLineArgumentError(name, value);
      }
      return value.trim().toLowerCase() === 'true';
    },
  });

type GetIntegerCliArgumentOptions = {
  readonly defaultValue?: number;
  readonly required?: boolean;
};

export const getIntegerCliArgument = <O extends GetIntegerCliArgumentOptions>(
  name: string,
  options: O,
): NamedArgumentRT<
  {
    parser: (v: string) => number;
  } & O
> =>
  getNamedArgument<
    {
      parser: (v: string) => number;
    } & O
  >(name, {
    ...options,
    parser: value => {
      const parsed = parseInt(value);
      if (isNaN(parsed) || !isFinite(parsed)) {
        throw new errors.InvalidCommandLineArgumentError(name, value);
      }
      return parsed;
    },
  });
