import { z } from 'zod';

import type * as types from './types';

import {
  AbstractEnvironment,
  type EnvironmentConfiguration,
  type EnvironmentOptions,
} from './abstract-environment';
import { type EnvironmentName } from './constants';

export class Environment<
  R extends types.RuntimeEnv<V>,
  V extends types.Validators<R>,
> extends AbstractEnvironment<types.EnvKey<R, V>, R, V> {
  private _env: types.Env<R, V> | undefined = undefined;

  public static create<R extends types.RuntimeEnv<V>, V extends types.Validators<R>>(
    name: EnvironmentName,
    { runtime, validators }: EnvironmentConfiguration<R, V>,
    options: EnvironmentOptions<R, V>,
  ): Environment<R, V> {
    return new Environment(name, { runtime, validators }, options);
  }

  protected parseOnInstantiation(): void {
    this.parseEnv();
  }

  private parseEnv(): types.Env<R, V> {
    const parsed = z.object(this.validators).safeParse(this.runtime);
    if (parsed.success) {
      return parsed.data;
    }
    this.onError(parsed.error);
    throw new Error("The 'onError' option did not throw an error as expected.");
  }

  public get<K extends types.EnvKey<R, V>>(key: K): types.EnvValue<K, R, V> {
    return this.env[key];
  }

  public get configurationString(): string {
    const lines: string[] = [];
    for (const key in this.env) {
      const k = key as keyof typeof this.env;
      const v = this.env[k];
      if (v !== undefined) {
        lines.push(this.formatLine(k, v, 'yellow'));
      }
    }
    return lines.join('\n');
  }

  private get env(): types.Env<R, V> {
    this._env ??= this.parseEnv();
    return this._env;
  }
}
