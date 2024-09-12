import { z } from "zod";

import type * as types from "./types";

import { UnreachableCaseError } from "~/application/errors";

import {
  AbstractEnvironment,
  type EnvironmentConfiguration,
  type EnvironmentOptions,
} from "./abstract-environment";
import { type EnvironmentName } from "./constants";

const isNextClientKey = <R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
  key: string,
): key is types.NextClientKey<R, V> => key.startsWith("NEXT_PUBLIC_");

const isNextServerOnlyKey = <R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
  key: string,
): key is types.NextServerOnlyKey<R, V> => !key.startsWith("NEXT_PUBLIC_");

const splitNextEnv = <R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
  merged: types.NextMergedEnv<R, V>,
): { client: types.NextClientEnv<R, V>; server: types.NextServerOnlyEnv<R, V> } => {
  const client = {} as types.NextClientEnv<R, V>;
  const server = {} as types.NextServerOnlyEnv<R, V>;
  for (const key in merged) {
    if (isNextClientKey(key)) {
      client[key] = merged[key];
    } else if (isNextServerOnlyKey(key)) {
      server[key] = merged[key];
    } else {
      throw new UnreachableCaseError(
        `The key '${key}' does not conform to either server or client key forms.`,
      );
    }
  }
  return { client, server };
};

export class NextEnvironment<
  R extends types.RuntimeEnv<V>,
  V extends types.Validators<R>,
> extends AbstractEnvironment<types.NextEnvKey<R, V>, R, V> {
  private _clientEnv: types.NextClientEnv<R, V> | undefined = undefined;
  private _serverOnlyEnv: types.NextServerOnlyEnv<R, V> | undefined = undefined;

  public static create<R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
    name: EnvironmentName,
    { validators, runtime }: EnvironmentConfiguration<R, V>,
    options: EnvironmentOptions<R, V>,
  ): NextEnvironment<R, V> {
    return new NextEnvironment(name, { validators, runtime }, options);
  }

  private get clientValidators(): types.NextClientValidators<R, V> {
    const vs = {} as types.NextClientValidators<R, V>;
    for (const key in this.validators) {
      if (isNextClientKey(key)) {
        vs[key] = this.validators[key];
      }
    }
    return vs;
  }

  private get serverOnlyValidators(): types.NextServerOnlyValidators<R, V> {
    const vs = {} as types.NextServerOnlyValidators<R, V>;
    for (const key in this.validators) {
      if (isNextServerOnlyKey(key)) {
        vs[key] = this.validators[key];
      }
    }
    return vs;
  }

  private get clientRuntime(): types.NextClientRuntime<R, V> {
    const runtime = {} as types.NextClientRuntime<R, V>;
    for (const key in this.runtime) {
      if (isNextClientKey(key)) {
        runtime[key] = this.runtime[key];
      }
    }
    return runtime;
  }

  private get serverOnlyRuntime(): types.NextServerOnlyRuntime<R, V> {
    const runtime = {} as types.NextServerOnlyRuntime<R, V>;
    for (const key in this.runtime) {
      if (isNextServerOnlyKey(key)) {
        runtime[key] = this.runtime[key];
      }
    }
    return runtime;
  }

  private get clientEnv(): types.NextClientEnv<R, V> {
    if (this._clientEnv === undefined) {
      this.parseClientEnv();
    }
    /* The client environment is set on the instance via the 'parseClientEnv' method, so this type
       coercion is safe. */
    return this._clientEnv as types.NextClientEnv<R, V>;
  }

  protected parseOnInstantiation() {
    if (typeof window === "undefined") {
      const parsed = z
        .object({ ...this.clientValidators, ...this.serverOnlyValidators })
        .safeParse({ ...this.clientRuntime, ...this.serverOnlyRuntime });
      if (parsed.success) {
        const env = parsed.data as types.NextMergedEnv<R, V>;
        const { client, server } = splitNextEnv(env);

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

  private parseClientEnv(): types.NextClientEnv<R, V> {
    const parsed = z.object(this.clientValidators).safeParse(this.clientRuntime);
    if (parsed.success) {
      /* I do not understand why this type coercion is necessary - but we should investigate it
         at a later point in time. */
      this._clientEnv = parsed.data as types.NextClientEnv<R, V>;
      return this._clientEnv;
    }
    this.onError(parsed.error);
    throw new Error("The 'onError' option did not throw an error as expected.");
  }

  private get serverOnlyEnv(): types.NextServerOnlyEnv<R, V> {
    if (this._serverOnlyEnv === undefined) {
      this._serverOnlyEnv = this.parseServerOnlyEnv();
    }
    return this._serverOnlyEnv;
  }

  protected parseServerOnlyEnv(): types.NextServerOnlyEnv<R, V> {
    const parsed = z.object(this.serverOnlyValidators).safeParse(this.serverOnlyRuntime);
    if (parsed.success) {
      this._serverOnlyEnv = parsed.data;
      return this._serverOnlyEnv;
    }
    this.onError(parsed.error);
    throw new Error("The 'onError' option did not throw an error as expected.");
  }

  public get configurationString(): string {
    const lines: string[] = [];
    for (const key in this.clientEnv) {
      const k = key as keyof typeof this.clientEnv;
      const v = this.clientEnv[k];
      if (v !== undefined) {
        lines.push(this.formatLine(k, v, "yellow"));
      }
    }
    for (const key in this.serverOnlyEnv) {
      const k = key as keyof typeof this.serverOnlyEnv;
      const v = this.serverOnlyEnv[k];
      if (v !== undefined) {
        lines.push(this.formatLine(k, v, "green"));
      }
    }
    return lines.join("\n");
  }

  public get<K extends types.NextEnvKey<R, V>>(key: K): types.EnvValue<K, R, V> {
    if (typeof window !== "undefined" || isNextClientKey(key)) {
      if (!isNextClientKey(key)) {
        throw new Error(`Attempted to access server-only key '${key}' on the client!`);
      }
      return this.clientEnv[key];
    } else if (isNextServerOnlyKey(key)) {
      return this.serverOnlyEnv[key];
    }
    throw new UnreachableCaseError(
      `Unexpectedly reached unreachable logic for key '${key}' that does not conform to ` +
        "server or client key specifications.",
    );
  }
}
