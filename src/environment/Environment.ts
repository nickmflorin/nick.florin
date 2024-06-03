import { z } from "zod";

import * as terminal from "~/application/support/terminal";

import {
  ConfigurationError,
  type ConfigurationErrorFormattingOptions,
  type ConfiguredError,
} from "./configuration-error";
import * as types from "./types";

type EnvironmentConfiguration<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = {
  readonly runtime: R;
  readonly validators: V;
};

type EnvironmentOptions<R extends types.RuntimeEnv<V>, V extends types.Validators<R>> = {
  readonly validationMethod?: types.EnvironmentValidationMethod;
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

    if (this.validationMethod === "instantiation") {
      this.parseAgnosticEnv();
    }
  }

  public static create<R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
    { validators, runtime }: EnvironmentConfiguration<R, V>,
    options: EnvironmentOptions<R, V>,
  ): Environment<R, V> {
    return new Environment({ validators, runtime }, options);
  }

  private get validationMethod(): types.EnvironmentValidationMethod {
    return this._options?.validationMethod ?? "first-access";
  }

  private get errorMessageConfig(): ConfigurationErrorFormattingOptions<R, V> | undefined {
    return this._options?.errorMessage;
  }

  private get clientValidators(): types.ClientValidators<R, V> {
    const vs = {} as types.ClientValidators<R, V>;
    for (const key in this.validators) {
      if (types.isClientKey(key)) {
        vs[key] = this.validators[key];
      }
    }
    return vs;
  }

  private get serverOnlyValidators(): types.ServerOnlyValidators<R, V> {
    const vs = {} as types.ServerOnlyValidators<R, V>;
    for (const key in this.validators) {
      if (types.isServerOnlyKey(key)) {
        vs[key] = this.validators[key];
      }
    }
    return vs;
  }

  private get clientRuntime(): types.ClientRuntime<R, V> {
    const runtime = {} as types.ClientRuntime<R, V>;
    for (const key in this.runtime) {
      if (types.isClientKey(key)) {
        runtime[key] = this.runtime[key];
      }
    }
    return runtime;
  }

  private get serverOnlyRuntime(): types.ServerOnlyRuntime<R, V> {
    const runtime = {} as types.ServerOnlyRuntime<R, V>;
    for (const key in this.runtime) {
      if (types.isServerOnlyKey(key)) {
        runtime[key] = this.runtime[key];
      }
    }
    return runtime;
  }

  private get clientEnv(): types.ClientEnv<R, V> {
    if (this._clientEnv === undefined) {
      this.parseClientEnv();
    }
    /* The client environment is set on the instance via the 'parseClientEnv' method, so this type
       coercion is safe. */
    return this._clientEnv as types.ClientEnv<R, V>;
  }

  private parseAgnosticEnv() {
    if (typeof window === "undefined") {
      const parsed = z
        .object({ ...this.clientValidators, ...this.serverOnlyValidators })
        .safeParse({ ...this.clientRuntime, ...this.serverOnlyRuntime });
      if (parsed.success) {
        const env = parsed.data as types.MergedEnv<R, V>;
        const { client, server } = types.splitEnv(env);

        this._clientEnv = client;
        this._serverOnlyEnv = server;
      } else {
        this.onError(parsed.error);
        throw new Error("The 'onError' option did not throw an error as expected.");
      }
    } else {
      this._clientEnv = this.parseClientEnv();
    }
  }

  private parseClientEnv(): types.ClientEnv<R, V> {
    const parsed = z.object(this.clientValidators).safeParse(this.clientRuntime);
    if (parsed.success) {
      /* I do not understand why this type coercion is necessary - but we should investigate it
         at a later point in time. */
      this._clientEnv = parsed.data as types.ClientEnv<R, V>;
      return this._clientEnv;
    }
    this.onError(parsed.error);
    throw new Error("The 'onError' option did not throw an error as expected.");
  }

  private get serverOnlyEnv(): types.ServerOnlyEnv<R, V> {
    if (this._serverOnlyEnv === undefined) {
      this._serverOnlyEnv = this.parseServerOnlyEnv();
    }
    return this._serverOnlyEnv;
  }

  private parseServerOnlyEnv(): types.ServerOnlyEnv<R, V> {
    const parsed = z.object(this.serverOnlyValidators).safeParse(this.serverOnlyRuntime);
    if (parsed.success) {
      this._serverOnlyEnv = parsed.data;
      return this._serverOnlyEnv;
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
  ): never;

  public throwConfigurationError(
    field: types.EnvKey<R, V>,
    message: string,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never;

  public throwConfigurationError(
    error: ConfiguredError<R, V> | types.EnvKey<R, V>,
    message?: string | ConfigurationErrorFormattingOptions<R, V>,
    options?: ConfigurationErrorFormattingOptions<R, V>,
  ): never {
    if (typeof error === "string") {
      if (typeof message !== "string") {
        throw new TypeError(
          "Invalid method implementation:  The second argument must be a message string.",
        );
      }
      throw new ConfigurationError(
        { message, field: error },
        { ...this.errorMessageConfig, ...options },
      );
    }
    throw new ConfigurationError(error, { ...this.errorMessageConfig, ...options });
  }

  public get configuration(): string {
    const lines: string[] = [];
    for (const key in this.clientEnv) {
      lines.push(
        `- ${key} = ${
          terminal.YELLOW + this.clientEnv[key as keyof typeof this.clientEnv] + terminal.RESET
        }`,
      );
    }
    for (const key in this.serverOnlyEnv) {
      lines.push(
        `- ${key} = ${
          terminal.GREEN +
          this.serverOnlyEnv[key as keyof typeof this.serverOnlyEnv] +
          terminal.RESET
        }`,
      );
    }
    return lines.join("\n");
  }

  public pick<K extends types.EnvKey<R, V>>(keys: K[]): { [key in K]: types.EnvValue<key, R, V> } {
    const env = {} as { [key in K]: types.EnvValue<key, R, V> };
    for (const key of keys) {
      env[key] = this.get(key);
    }
    return env;
  }

  public get<K extends types.EnvKey<R, V>>(key: K): types.EnvValue<K, R, V> {
    if (typeof window !== "undefined" || types.isClientKey(key)) {
      if (!types.isClientKey(key)) {
        throw new Error(`Attempted to access server-only key '${key}' on the client!`);
      }
      return this.clientEnv[key];
    } else if (types.isServerOnlyKey(key)) {
      return this.serverOnlyEnv[key];
    }
    throw new Error(
      `Unexpectedly reached unreachable logic for key '${key}' that does not conform to ` +
        "server or client key specifications.",
    );
  }
}
