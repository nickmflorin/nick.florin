import { type z } from 'zod';

import type * as types from './types';

import { terminal } from '~/support';

import {
  ConfigurationError,
  type ConfigurationErrorFormattingOptions,
  type ConfiguredError,
} from './configuration-error';
import { type EnvironmentName, EnvironmentNames } from './constants';

export type EnvironmentConfiguration<
  R extends types.RuntimeEnv<V>,
  V extends types.Validators<R>,
> = {
  readonly runtime: R;
  readonly validators: V;
};

export type EnvironmentOptions<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = {
  readonly errorMessage?: ConfigurationErrorFormattingOptions<R, V>;
  readonly onError?: (err: ConfigurationError<R, V>) => void;
  readonly validationMethod?: types.EnvironmentValidationMethod;
};

type EnvironmentMap<T = unknown> = Record<EnvironmentName, T>;

// prettier-ignore
type EnvironmentMapResult<M extends Partial<EnvironmentMap>> = M extends EnvironmentMap<infer T>
  ? T
  : M extends Partial<EnvironmentMap<infer T>>
  ? T | undefined
  : never;

// prettier-ignore
type EnvironmentMapRestrictedResult<M extends Partial<EnvironmentMap>> = M extends Partial<
  EnvironmentMap<infer T>
>
  ? T
  : never;

export abstract class AbstractEnvironment<
  K extends types.EnvKey<R, V>,
  R extends types.RuntimeEnv<V>,
  V extends types.Validators<R>,
> {
  protected readonly runtime: R;
  protected readonly validators: V;
  private readonly _options?: EnvironmentOptions<R, V>;
  public readonly name: EnvironmentName;

  constructor(
    name: EnvironmentName,
    { runtime, validators }: EnvironmentConfiguration<R, V>,
    options?: EnvironmentOptions<R, V>,
  ) {
    this.name = name;
    this.validators = validators;
    this.runtime = runtime;
    this._options = options;

    if (this.validationMethod === 'instantiation') {
      this.parseOnInstantiation();
    }
  }

  protected formatLine(
    key: K,
    value: NonNullable<types.EnvValue<K, R, V>>,
    style: terminal.TerminalStyle,
  ): string {
    const formatted = terminal.applyStyles(String(value), style);
    return `- ${key} = ${formatted}`;
  }

  protected onError(error: z.ZodError) {
    const e = new ConfigurationError(error, this.errorMessageConfig);
    const handler =
      this._options?.onError ??
      (err => {
        throw err;
      });
    handler(e);
  }

  protected abstract parseOnInstantiation(): void;

  public ConfigurationError(
    error: ConfiguredError<R, V>,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never;

  public ConfigurationError(
    field: types.EnvKey<R, V>,
    message: string,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never;

  public ConfigurationError(
    error: ConfiguredError<R, V> | types.EnvKey<R, V>,
    message?: ConfigurationErrorFormattingOptions<R, V> | string,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): ConfigurationError<R, V> {
    if (typeof error === 'string') {
      if (typeof message !== 'string') {
        throw new TypeError(
          'Invalid method implementation:  The second argument must be a message string.',
        );
      }
      return new ConfigurationError(
        { field: error, message },
        { ...this.errorMessageConfig, ...options },
      );
    }
    return new ConfigurationError(error, { ...this.errorMessageConfig, ...options });
  }

  public abstract get<N extends K>(key: N): types.EnvValue<N, R, V>;

  /**
   * Returns the value in the map, {@link M}, associated with the current environment.
   *
   * @param {M} map A mapping of environment names to values.
   *
   * @returns {EnvironmentMapResult<M>}
   *   The value associated with the current environment in the provided map.
   */
  public getFromMap<M extends Partial<EnvironmentMap>>(map: M): EnvironmentMapResult<M> {
    return map[this.name] as EnvironmentMapResult<M>;
  }

  /**
   * Returns the value in the map, {@link M}, associated with the current environment.  If the
   * current environment is not found in the map, {@link M}, the method will treat the logic as
   * though it is restricted from being used in the current environment, and an {@link Error} will
   * be thrown.
   *
   * @param {M} map A mapping of environment names to values.
   *
   * @throws {Error} If the current environment matches a name that is missing from the map.
   *
   * @returns {EnvironmentMapRestrictedResult<M>}
   *   The value associated with the current environment in the provided map.
   */
  public getFromRestrictedMap<M extends Partial<EnvironmentMap>>(
    map: M,
  ): EnvironmentMapRestrictedResult<M> {
    const value = map[this.name];
    if (value === undefined) {
      throw new Error(
        `Accessing logic that is restricted from environment '${this.name}' while ` +
          "in that environment'!",
      );
    }
    return value as EnvironmentMapRestrictedResult<M>;
  }

  public pick<N extends K>(keys: N[]): { [key in N]: types.EnvValue<key, R, V> } {
    const env = {} as { [key in N]: types.EnvValue<key, R, V> };
    for (const key of keys) {
      env[key] = this.get(key);
    }
    return env;
  }

  public restrictFromEnvironments(
    disallowedEnvironment: [EnvironmentName, ...EnvironmentName[]] | EnvironmentName,
  ) {
    const envs = Array.isArray(disallowedEnvironment)
      ? disallowedEnvironment
      : [disallowedEnvironment];
    if (envs.includes(this.name)) {
      if (envs.length === 1) {
        throw new Error(
          `Accessing logic that is restricted from environment '${envs[0]}' while ` +
            `in environment '${this.name}'!`,
        );
      }
      const humanized = envs.map(env => `'${env}'`).join(', ');
      throw new Error(
        `Accessing logic that is restricted from environment(s) ${humanized} while ` +
          `in environment '${this.name}'!`,
      );
    }
  }

  public restrictToEnvironments(
    allowedEnvironment: [EnvironmentName, ...EnvironmentName[]] | EnvironmentName,
  ) {
    const envs = Array.isArray(allowedEnvironment) ? allowedEnvironment : [allowedEnvironment];
    if (!envs.includes(this.name)) {
      if (envs.length === 1) {
        throw new Error(
          `Accessing logic that is restricted to environment '${envs[0]}' while ` +
            `in environment '${this.name}'!`,
        );
      }
      const humanized = envs.map(env => `'${env}'`).join(', ');
      throw new Error(
        `Accessing logic that is restricted to environment(s) ${humanized} while ` +
          `in environment '${this.name}'!`,
      );
    }
  }

  public throwConfigurationError(
    error: ConfiguredError<R, V>,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never;

  public throwConfigurationError(
    field: types.EnvKey<R, V>,
    message: string,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never;

  public throwConfigurationError(
    error: ConfiguredError<R, V> | types.EnvKey<R, V>,
    message?: ConfigurationErrorFormattingOptions<R, V> | string,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never {
    if (typeof error === 'string') {
      if (typeof message !== 'string') {
        throw new TypeError(
          'Invalid method implementation:  The second argument must be a message string.',
        );
      }
      throw new ConfigurationError(
        { field: error, message },
        { ...this.errorMessageConfig, ...options },
      );
    }
    throw new ConfigurationError(error, { ...this.errorMessageConfig, ...options });
  }

  public abstract get configurationString(): string;

  private get errorMessageConfig(): ConfigurationErrorFormattingOptions<R, V> | undefined {
    return this._options?.errorMessage;
  }

  public get isLocal() {
    return this.name === EnvironmentNames.LOCAL;
  }

  public get isPreview() {
    return this.name === EnvironmentNames.PREVIEW;
  }

  public get isProduction() {
    return this.name === EnvironmentNames.PRODUCTION;
  }

  public get isTest() {
    return this.name === EnvironmentNames.TEST;
  }

  private get validationMethod(): types.EnvironmentValidationMethod {
    return this._options?.validationMethod ?? 'first-access';
  }
}
