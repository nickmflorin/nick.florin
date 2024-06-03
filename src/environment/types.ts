import { type z } from "zod";

import { UnreachableCaseError } from "~/application/errors";

type ValidEnvValue = string | number | boolean | undefined | string[];

type BaseRuntimeEnv = {
  [key in string]: string | undefined;
};

export type EnvironmentValidationMethod = "first-access" | "instantiation";

export type ClientKey<R extends RuntimeEnv<V>, V extends Validators<R>> = Extract<
  Extract<keyof R, string> & Extract<keyof V, string>,
  `NEXT_PUBLIC_${string}`
>;

export type ServerOnlyKey<R extends RuntimeEnv<V>, V extends Validators<R>> = Exclude<
  Extract<keyof R, string> & Extract<keyof V, string>,
  `NEXT_PUBLIC_${string}`
>;

export type EnvKey<R extends RuntimeEnv<V>, V extends Validators<R>> =
  | ClientKey<R, V>
  | ServerOnlyKey<R, V>;

export type EnvValue<
  K extends EnvKey<R, V>,
  R extends RuntimeEnv<V>,
  V extends Validators<R>,
> = z.infer<V[K]>;

export type Validators<R extends BaseRuntimeEnv = BaseRuntimeEnv> = {
  [key in Extract<keyof R, string>]: z.ZodType<ValidEnvValue>;
};

export type ClientValidators<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ClientKey<R, V>]: V[key];
};

export type ClientRuntime<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ClientKey<R, V>]: R[key];
};

export type ClientEnv<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ClientKey<R, V>]: EnvValue<key, R, V>;
};

export type ServerOnlyValidators<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ServerOnlyKey<R, V>]: V[key];
};

export type ServerOnlyRuntime<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ServerOnlyKey<R, V>]: R[key];
};

export type ServerOnlyEnv<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ServerOnlyKey<R, V>]: EnvValue<key, R, V>;
};

export type RuntimeEnv<V extends Validators> = {
  [key in Extract<keyof V, string>]: string | undefined;
};

export type MergedEnv<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in ServerOnlyKey<R, V> | ClientKey<R, V>]: R[key];
};

export const isClientKey = <R extends RuntimeEnv<V>, V extends Validators<R>>(
  key: string,
): key is ClientKey<R, V> => key.startsWith("NEXT_PUBLIC_");

export const isServerOnlyKey = <R extends RuntimeEnv<V>, V extends Validators<R>>(
  key: string,
): key is ServerOnlyKey<R, V> => !key.startsWith("NEXT_PUBLIC_");

export const splitEnv = <R extends RuntimeEnv<V>, V extends Validators<R>>(
  merged: MergedEnv<R, V>,
): { client: ClientEnv<R, V>; server: ServerOnlyEnv<R, V> } => {
  const client = {} as ClientEnv<R, V>;
  const server = {} as ServerOnlyEnv<R, V>;
  for (const key in merged) {
    if (isClientKey(key)) {
      client[key] = merged[key];
    } else if (isServerOnlyKey(key)) {
      server[key] = merged[key];
    } else {
      throw new UnreachableCaseError(
        `The key '${key}' does not conform to either server or client key forms.`,
      );
    }
  }
  return { client, server };
};
