import { z } from "zod";

import type * as types from "./types";

import {
  ConfigurationError,
  type ConfigurationErrorFormattingOptions,
  type ConfiguredError,
} from "./configuration-error";

type EnvironmentConfiguration<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = {
  readonly runtime: R;
  readonly validators: V;
};

type EnvironmentOptions<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = {
  readonly errorMessage?: ConfigurationErrorFormattingOptions<R, V>;
  readonly onError?: (err: ConfigurationError<R, V>) => void;
};

export class Environment<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> {
  private readonly validators: V;
  private readonly runtime: R;
  private readonly _options?: EnvironmentOptions<R, V>;

  private _clientEnv: types.ClientEnv<R, V> | undefined = undefined;
  private _serverOnlyEnv: types.ServerOnlyEnv<R, V> | undefined = undefined;

  constructor(
    { validators, runtime }: EnvironmentConfiguration<R, V>,
    options?: EnvironmentOptions<R, V>,
  ) {
    this.validators = validators;
    this.runtime = runtime;
    this._options = options;
  }

  public static create<R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
    { validators, runtime }: EnvironmentConfiguration<R, V>,
    options: EnvironmentOptions<R, V>,
  ): Environment<R, V> {
    return new Environment({ validators, runtime }, options);
  }

  private isClientKey(key: string): key is types.ClientKey<R, V> {
    return key.startsWith("NEXT_PUBLIC_");
  }

  private isServerOnlyKey(key: string): key is types.ServerOnlyKey<R, V> {
    return !key.startsWith("NEXT_PUBLIC_");
  }

  private get errorMessageConfig(): ConfigurationErrorFormattingOptions<R, V> | undefined {
    return this._options?.errorMessage;
  }

  private get clientValidators(): types.ClientValidators<R, V> {
    const vs = {} as types.ClientValidators<R, V>;
    for (const key in this.validators) {
      if (this.isClientKey(key)) {
        vs[key] = this.validators[key];
      }
    }
    return vs;
  }

  private get serverOnlyValidators(): types.ServerOnlyValidators<R, V> {
    const vs = {} as types.ServerOnlyValidators<R, V>;
    for (const key in this.validators) {
      if (this.isServerOnlyKey(key)) {
        vs[key] = this.validators[key];
      }
    }
    return vs;
  }

  private get clientRuntime(): types.ClientRuntime<R, V> {
    const runtime = {} as types.ClientRuntime<R, V>;
    for (const key in this.runtime) {
      if (this.isClientKey(key)) {
        runtime[key] = this.runtime[key];
      }
    }
    return runtime;
  }

  private get serverOnlyRuntime(): types.ServerOnlyRuntime<R, V> {
    const runtime = {} as types.ServerOnlyRuntime<R, V>;
    for (const key in this.runtime) {
      if (this.isServerOnlyKey(key)) {
        runtime[key] = this.runtime[key];
      }
    }
    return runtime;
  }

  private parseClientEnv(): types.ClientEnv<R, V> {
    const parsed = z.object(this.clientValidators).safeParse(this.clientRuntime);
    if (parsed.success) {
      return parsed.data;
    }
    this.onError(parsed.error);
    throw new Error("The 'onError' option did not throw an error as expected.");
  }

  private parseServerOnlyEnv(): types.ServerOnlyEnv<R, V> {
    const parsed = z.object(this.serverOnlyValidators).safeParse(this.serverOnlyRuntime);
    if (parsed.success) {
      return parsed.data;
    }
    this.onError(parsed.error);
    throw new Error("The 'onError' option did not throw an error as expected.");
  }

  private onError(error: z.ZodError) {
    const e = new ConfigurationError(error, this.errorMessageConfig);
    /* eslint-disable-next-line no-console */
    const handler =
      this._options?.onError ??
      (err => {
        throw err;
      });
    handler(e);
  }

  public throwConfigurationError(
    error: ConfiguredError<R, V>,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never {
    throw new ConfigurationError(error, { ...this.errorMessageConfig, ...options });
  }

  public get<K extends types.EnvKey<R, V>>(key: K): types.EnvValue<K, R, V> {
    if (typeof window !== "undefined" || this.isClientKey(key)) {
      if (!this.isClientKey(key)) {
        throw new Error(`Attempted to access server-only key '${key}' on the client!`);
      }
      if (this._clientEnv === undefined) {
        this._clientEnv = this.parseClientEnv();
      }
      return this._clientEnv[key];
    } else if (this.isServerOnlyKey(key)) {
      if (this._serverOnlyEnv === undefined) {
        this._serverOnlyEnv = this.parseServerOnlyEnv();
      }
      return this._serverOnlyEnv[key];
    }
    throw new Error(
      `Unexpectedly reached unreachable logic for key '${key}' that does not conform to ` +
        "server or client key specifications.",
    );
  }
}
