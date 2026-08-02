import pino, { type DestinationStream, type LoggerOptions } from 'pino';
import { v4 as uuid } from 'uuid';

import {
  type EnvironmentName,
  type LogLevel,
  type VercelEnvironmentName,
} from '~/environment/constants';

import { DEFAULT_LOG_LEVELS } from './constants';
import { type AbstractLoggerConfig } from './types';

type LogMethodType = 'debug' | 'error' | 'info' | 'warn';

export abstract class AbstractLogger {
  protected readonly instance: string;
  private readonly _environment: EnvironmentName;
  private _includeContext: boolean | undefined;
  private _level: LogLevel | undefined = undefined;
  private _pino: null | pino.Logger = null;
  private readonly _vercelEnvironment: undefined | VercelEnvironmentName = undefined;
  private readonly globalContext: Record<string, unknown> | undefined = undefined;
  public readonly name: string;

  constructor(
    name: string,
    { environment, globalContext, includeContext, level, vercelEnvironment }: AbstractLoggerConfig,
  ) {
    this.instance = uuid();
    this._environment = environment;
    this._vercelEnvironment = vercelEnvironment;
    this._level = level;
    this.globalContext = globalContext;
    this.name = name;
    this._includeContext = includeContext;
  }

  protected log(method: LogMethodType, context: object): void;

  protected log(method: LogMethodType, message: string | undefined, context?: object): void;

  protected log(
    method: LogMethodType,
    message: object | string | undefined,
    context?: object,
  ): void {
    const ctx = typeof message === 'string' ? (context ?? {}) : message;
    const msg = typeof message === 'string' ? message : undefined;
    this.pino[method](ctx, msg);
  }

  private reset() {
    if (this.stream) {
      this._pino = pino(this.config, this.stream);
    } else {
      this._pino = pino(this.config);
    }
  }

  public modify({
    includeContext,
    level,
  }: Pick<AbstractLoggerConfig, 'includeContext' | 'level'>): void {
    let reset = false;

    if (includeContext !== undefined) {
      if (includeContext && !this.includeContext) {
        this._includeContext = includeContext;
        /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
        console.info('Resetting logger to include context...');
        reset = true;
      } else if (!includeContext && this.includeContext) {
        this._includeContext = includeContext;
        /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
        console.info('Resetting logger to exclude context...');
        reset = true;
      }
    }

    if (includeContext && !this.includeContext) {
      this._includeContext = includeContext;
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info('Resetting logger to include context...');
      this.reset();
    } else if (!includeContext && this.includeContext) {
      this._includeContext = includeContext;
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info('Resetting logger to exclude context...');
      this.reset();
    }
    if (level !== this.level) {
      this._level = level;
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info(`Resetting logger with level '${level}'...`);
      reset = true;
    }
    if (reset) {
      this.reset();
    }
  }

  protected abstract get config(): LoggerOptions;

  protected get context() {
    let ctx: Record<string, unknown> = {
      name: this.name,
    };
    if (this.includeContext) {
      ctx = {
        ...ctx,
        ...this.globalContext,
        environment: this.environment,
        instance: this.instance,
        vercelEnvironment: this.vercelEnvironment,
      };
    }
    return Object.keys(ctx).reduce(
      (prev, key) => (ctx[key] === undefined ? prev : { ...prev, [key]: ctx[key] }),
      {} as Record<string, unknown>,
    );
  }

  protected get environment() {
    return this._environment;
  }

  public get includeContext() {
    return this._includeContext ?? true;
  }

  public set includeContext(includeContext: boolean) {
    this.modify({ includeContext });
  }

  public get level() {
    return this._level ?? DEFAULT_LOG_LEVELS[this.environment];
  }

  public set level(level: LogLevel) {
    this.modify({ level });
  }

  private get pino() {
    if (!this._pino) {
      this.reset();
    }
    /* This type coercion is safe because we are setting the _pino instance variable in the reset
       method. */
    return this._pino as pino.Logger;
  }
  protected abstract get stream(): DestinationStream | null;

  private get vercelEnvironment() {
    return this._vercelEnvironment;
  }
}
