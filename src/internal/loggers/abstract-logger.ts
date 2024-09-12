import pino, { type LoggerOptions, type DestinationStream } from "pino";
import { v4 as uuid } from "uuid";

import { type VercelEnvironmentName, type EnvironmentName, LogLevel } from "~/environment/constants";

import { DEFAULT_LOG_LEVELS } from "./constants";
import { type AbstractLoggerConfig } from "./types";

type LogMethodType = "warn" | "error" | "info" | "debug";

export abstract class AbstractLogger {
  public readonly name: string;

  protected readonly instance: string;
  private readonly globalContext: Record<string, unknown> | undefined = undefined;

  private _level: LogLevel | undefined = undefined;
  private _pino: pino.Logger | null = null;

  private readonly _vercelEnvironment: VercelEnvironmentName | undefined = undefined;
  private readonly _environment: EnvironmentName;
  private _includeContext: boolean | undefined;

  constructor(
    name: string,
    { environment, level, globalContext, vercelEnvironment, includeContext }: AbstractLoggerConfig,
  ) {
    this.instance = uuid();
    this._environment = environment;
    this._vercelEnvironment = vercelEnvironment;
    this._level = level;
    this.globalContext = globalContext;
    this.name = name;
    this._includeContext = includeContext;
  }

  protected abstract get stream(): DestinationStream | null;

  protected abstract get config(): LoggerOptions;

  protected get environment() {
    return this._environment;
  }

  private get vercelEnvironment() {
    return this._vercelEnvironment;
  }

  public modify({
    includeContext,
    level,
  }: Pick<AbstractLoggerConfig, "includeContext" | "level">): void {
    let reset = false;

    if (includeContext !== undefined) {
      if (includeContext && !this.includeContext) {
        this._includeContext = includeContext;
        /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
        console.info("Resetting logger to include context...");
        reset = true;
      } else if (!includeContext && this.includeContext) {
        this._includeContext = includeContext;
        /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
        console.info("Resetting logger to exclude context...");
        reset = true;
      }
    }

    if (includeContext && !this.includeContext) {
      this._includeContext = includeContext;
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info("Resetting logger to include context...");
      this.reset();
    } else if (!includeContext && this.includeContext) {
      this._includeContext = includeContext;
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info("Resetting logger to exclude context...");
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
      (prev, key) => (ctx[key] !== undefined ? { ...prev, [key]: ctx[key] } : prev),
      {} as Record<string, unknown>,
    );
  }

  private reset() {
    if (this.stream) {
      this._pino = pino(this.config, this.stream);
    } else {
      this._pino = pino(this.config);
    }
  }

  protected log(method: LogMethodType, context: object): void;
  protected log(method: LogMethodType, message: string | undefined, context?: object): void;
  protected log(
    method: LogMethodType,
    message: string | object | undefined,
    context?: object,
  ): void {
    const ctx = typeof message === "string" ? (context ?? {}) : message;
    const msg = typeof message === "string" ? message : undefined;
    this.pino[method](ctx, msg);
  }

  private get pino() {
    if (!this._pino) {
      this.reset();
    }
    /* This type coercion is safe because we are setting the _pino instance variable in the reset
       method. */
    return this._pino as pino.Logger;
  }
}
