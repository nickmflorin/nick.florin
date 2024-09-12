import { type z } from "zod";

type ValidEnvValue = string | number | boolean | undefined | string[];

type BaseRuntimeEnv = {
  [key in string]: string | undefined;
};

export type EnvironmentValidationMethod = "first-access" | "instantiation";

export type EnvKey<R extends RuntimeEnv<V>, V extends Validators<R>> = Extract<keyof R, string> &
  Extract<keyof V, string>;

export type NextClientKey<R extends RuntimeEnv<V>, V extends Validators<R>> = Extract<
  EnvKey<R, V>,
  `NEXT_PUBLIC_${string}`
>;

export type NextServerOnlyKey<R extends RuntimeEnv<V>, V extends Validators<R>> = Exclude<
  EnvKey<R, V>,
  `NEXT_PUBLIC_${string}`
>;

export type NextEnvKey<R extends RuntimeEnv<V>, V extends Validators<R>> =
  | NextClientKey<R, V>
  | NextServerOnlyKey<R, V>;

export type EnvValue<
  K extends EnvKey<R, V>,
  R extends RuntimeEnv<V>,
  V extends Validators<R>,
> = z.infer<V[K]>;

export type Env<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in EnvKey<R, V>]: EnvValue<key, R, V>;
};

export type Validators<R extends BaseRuntimeEnv = BaseRuntimeEnv> = {
  [key in Extract<keyof R, string>]: z.ZodType<ValidEnvValue>;
};

export type NextClientValidators<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextClientKey<R, V>]: V[key];
};

export type NextClientRuntime<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextClientKey<R, V>]: R[key];
};

export type NextClientEnv<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextClientKey<R, V>]: EnvValue<key, R, V>;
};

export type NextServerOnlyValidators<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextServerOnlyKey<R, V>]: V[key];
};

export type NextServerOnlyRuntime<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextServerOnlyKey<R, V>]: R[key];
};

export type NextServerOnlyEnv<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextServerOnlyKey<R, V>]: EnvValue<key, R, V>;
};

export type RuntimeEnv<V extends Validators> = {
  [key in Extract<keyof V, string>]: string | undefined;
};

export type NextMergedEnv<R extends RuntimeEnv<V>, V extends Validators<R>> = {
  [key in NextServerOnlyKey<R, V> | NextClientKey<R, V>]: R[key];
};
