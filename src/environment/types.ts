import { type z } from "zod";

type ValidEnvValue = string | number | boolean | undefined | string[];

type BaseRuntimeEnv = {
  [key in string]: string | undefined;
};

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
