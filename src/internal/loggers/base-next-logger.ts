import { UnreachableCaseError } from "~/application/errors";

import { isApiClientGlobalErrorJson, isApiError } from "~/api-v2";
import { environment } from "~/environment";
import { type EnvironmentName } from "~/environment/constants";
import {
  VercelEnvironmentNames,
  EnvironmentNames,
  LogLevels,
  getEnvironmentName,
} from "~/environment/constants";

import { AbstractLogger } from "./abstract-logger";
import { createBrowserWriter } from "./browser-writer";
import { DEFAULT_PRETTY_LOGGING, DEFAULT_LOGGING_TRANSPORTS } from "./constants";
import * as types from "./types";

const getNonErrorObjectSanitizedErrorMessage = (error: unknown): string => {
  if (
    typeof error === "string" ||
    typeof error === "boolean" ||
    typeof error === "undefined" ||
    error === null
  ) {
    return `The provided data, '${String(
      error,
    )}', is not a valid, loggable error object and cannot be logged.`;
  }
  try {
    return `The provided data, '${JSON.stringify(
      error,
    )}', is not a valid, loggable error object and cannot be logged.`;
  } catch (e) {
    return "The provided data is not a valid, loggable error object and cannot be logged.";
  }
};

const parseCaptureContext = (
  context: types.CaptureContext,
): [types.CaptureOptions, Record<string, unknown>] => {
  const { capture = true, ...rest } = context;
  return [{ capture }, rest];
};

type ParsedArgs = {
  error?: Error;
  message?: string;
  context?: Record<string, unknown>;
  options: types.CaptureOptions;
};

const includeErrorContext = (parsed: ParsedArgs, error: types.LoggerError): ParsedArgs => {
  if (isApiError(error)) {
    return {
      ...parsed,
      message: parsed.message ?? error.message,
      context: { ...parsed.context, ...error.logData },
      /* Here, it is okay to include the 'error' property because the HttpError is an actual Error
         object, and can be used with 'Sentry.captureException'. */
      error,
    };
  } else if (error instanceof Error) {
    return {
      ...parsed,
      error,
      message: parsed.message ?? error.message,
      context: {
        ...parsed.context,
        message: error.message,
      },
    };
  } else if (isApiClientGlobalErrorJson(error)) {
    return {
      ...parsed,
      message: parsed.message ?? error.message,
      context: { ...parsed.context, ...error },
    };
  } else {
    throw new UnreachableCaseError(`Invalid error object provided to logger: ${error}.`);
  }
};

/**
 * A extension of the {@link AbstractLogger} class that should be used for logging in a Next.js
 * context.
 */
export abstract class BaseNextLogger extends AbstractLogger {
  protected readonly _pretty: boolean | undefined = undefined;
  private readonly _transports:
    | types.NextLoggerTransport[]
    | Partial<Record<EnvironmentName, types.NextLoggerTransport[]>>
    | undefined = undefined;

  constructor(
    name: string,
    {
      environment,
      level,
      pretty,
      globalContext,
      transports,
      vercelEnvironment,
    }: types.NextLoggerConfig,
  ) {
    super(name, { environment, level, globalContext, vercelEnvironment });
    this._pretty = pretty;
    this._transports = transports;
  }

  protected static createConfig(
    config?: Partial<Omit<types.NextLoggerConfig, "environment" | "vercelEnvironment">>,
  ): types.NextLoggerConfig {
    // const SENTRY_ENABLED = environment.get("NEXT_PUBLIC_SENTRY_ENABLED");
    const SENTRY_ENABLED = false;

    /* The VercelEnvironment is allowed to be undefined - as it may be in local development.  In
       these cases, the EnvironmentName can be determined based on the NODE_ENV environment=
       variable. */
    const vercelEnvironment = process.env.VERCEL_ENV;
    if (vercelEnvironment !== undefined && !VercelEnvironmentNames.contains(vercelEnvironment)) {
      throw environment.ConfigurationError(
        "VERCEL_ENV",
        `The value '${vercelEnvironment}' for environment variable 'VERCEL_ENV' is invalid!`,
      );
    }
    return {
      level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
      transports: {
        [EnvironmentNames.PRODUCTION]: SENTRY_ENABLED ? ["sentry"] : [],
        [EnvironmentNames.PREVIEW]: SENTRY_ENABLED ? ["sentry", "browser"] : ["browser"],
        [EnvironmentNames.LOCAL]: SENTRY_ENABLED ? ["sentry", "browser"] : ["browser"],
        [EnvironmentNames.TEST]: [],
      },
      globalContext: {
        vercelGitCommitSha: environment.get("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"),
        ...config?.globalContext,
      },
      ...config,
      environment: getEnvironmentName({
        vercelEnvironment,
        nodeEnvironment: process.env.NODE_ENV,
      }),
      vercelEnvironment,
    };
  }

  protected get pretty() {
    return this._pretty ?? DEFAULT_PRETTY_LOGGING[this.environment];
  }

  private get transports() {
    if (Array.isArray(this._transports)) {
      return this._transports;
    }
    const transportsMap = { ...DEFAULT_LOGGING_TRANSPORTS, ...this._transports };
    return transportsMap[this.environment];
  }

  private hasTransport(transport: types.NextLoggerTransport): boolean {
    return this.transports.includes(transport);
  }

  private get browserWriter() {
    return createBrowserWriter({
      name: this.name,
      pretty: this.pretty,
      environment: this.environment,
    });
  }

  protected get config() {
    const base = {
      level: this.level,
      base: this.context,
      environment: this.environment,
      instance: this.instance,
      name: this.name,
    };
    if (this.hasTransport("browser")) {
      return { ...base, browser: { write: this.browserWriter, asObject: true } };
    }
    return { ...base, browser: { disabled: true } };
  }

  public captureError(error: types.LoggerError, context?: types.SentryCaptureContext) {
    if (this.hasTransport("sentry")) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { level = LogLevels.ERROR, ...rest } = context ?? {};
      /* Sentry.captureException(error, {
           level: LevelSeverityLevelMap[level],
           extra: { ...this.context, ...rest },
         }); */
    }
  }

  public captureMessage(message: string, context?: types.SentryCaptureContext) {
    if (this.hasTransport("sentry")) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { level = LogLevels.ERROR, ...rest } = context ?? {};
      /* Sentry.captureMessage(message, {
           level: LevelSeverityLevelMap[level],
           extra: { ...this.context, ...rest },
         }); */
    }
  }

  private parseErrorArgs(
    arg0: types.LoggerError | string | types.CaptureContext,
    arg1?: string | types.CaptureContext,
    arg2?: types.CaptureContext,
  ): ParsedArgs {
    if (types.isLoggerError(arg0) && typeof arg1 === "string") {
      const [options, context] = parseCaptureContext(arg2 ?? {});
      return includeErrorContext({ message: arg1, context, options }, arg0);
    } else if (typeof arg1 === "string") {
      throw new TypeError("Invalid method implementation!");
    } else if (types.isLoggerError(arg0)) {
      const [options, context] = parseCaptureContext(arg1 ?? {});
      return includeErrorContext({ context, options }, arg0);
    } else if (typeof arg0 === "string") {
      const [options, context] = parseCaptureContext(arg1 ?? {});
      return { message: arg0, options, context };
    }
    const [options, context] = parseCaptureContext(arg1 ?? {});
    return { options, context };
  }

  public warnUnsafe(data: unknown, message: string, context?: types.CaptureContext): void;
  public warnUnsafe(data: unknown, context?: Record<string, unknown>): void;
  /**
   * A variation of the {@link warn} method that can be used when we are not 100% sure that the
   * error object is in fact a {@link LoggerError}.  This is primarily to satisfy TypeScript's
   * {@link unknown} typing in catch clauses.
   */
  public warnUnsafe(
    data: unknown,
    message?: string | types.CaptureContext,
    context?: types.CaptureContext,
  ): void {
    if (!types.isLoggerError(data)) {
      throw new TypeError(getNonErrorObjectSanitizedErrorMessage(data));
    }
    if (typeof message === "string") {
      return this.warn(data, message, context);
    }
    return this.warn(data, message);
  }

  public warn(data: types.LoggerError, message?: string, context?: types.CaptureContext): void;
  public warn(data: types.LoggerError | string, context?: types.CaptureContext): void;
  public warn(context: types.CaptureContext): void;
  /**
   * Logs a warning message, {@link string}, error object {@link LoggerError}, or combination of
   * both, with a log level "warning", via the {@link NextLogger} instance.
   *
   * The method will optionally dispatch the {@link LoggerError} or message, {@link string}, to
   * Sentry depending on the 'capture' option provided in the {@link types.CaptureContext}.
   *
   * The various function signatures on the method allow it to be used in different contexts, which
   * are as follows:
   *
   * 1. logger.warn(error: LoggerError, message: string, context?: types.CaptureContext);
   * 2. logger.warn(error: LoggerError, context?: types.CaptureContext);
   * 3. logger.warn(message: string, context?: types.CaptureContext);
   * 4. logger.warn(context: types.CaptureContext);
   *
   * @param {LoggerError | string} data
   *   Either an {@link LoggerError} object or a {@link string} message that should be logged.  If
   *   a {@link LoggerError} object is provided, the {@link string} message can be optionally
   *   provided as the second argument.
   *
   * @param {string | types.CaptureContext} msg
   *   Either a {@link string} message that should be logged (in the case that the first argument
   *   is an {@link LoggerError} object) or the {@link types.CaptureContext} that includes options
   *   and additional context that shoudl be logged with the message (in the case that the first
   *   argument is a {@link string} message).
   *
   *   See {@link types.CaptureContext} for more information.
   *
   * @param {CaptureContext} ctx
   *   The `context` argument is optional and can be used to both provide options to the method and
   *   to provide additional context to the data that is logged.  If the 'capture' option is
   *   not specified as 'false', the log message and/or error will be dispatched to Sentry.
   *
   *   @example
   *   ```ts
   *   // Dispatches error and message to Sentry.  The User's ID will be included in the log
   *   // context.
   *   logger.warn(e, "An error occurred when the user logged in!", { user: user.id })
   *   ```
   *
   *   @example
   *   ```ts
   *   // Does not dispatch error and message to Sentry.  The User's ID will be included in the log
   *   // context.
   *   logger.warn(e, "An error occurred when the user logged in!", {
   *     user: user.id,
   *     capture: false
   *   })
   *   ```
   */
  public warn(
    data: types.LoggerError | string | types.CaptureContext,
    msg?: string | types.CaptureContext,
    ctx?: types.CaptureContext,
  ): void {
    const { error, message, context, options } = this.parseErrorArgs(data, msg, ctx);
    this.log("warn", message ?? error?.message, context ?? {});

    /* If the 'capture' option is specified, either send the LoggerError to Sentry (if it is
       provided) or send the message to Sentry. */
    if (options.capture) {
      if (error && message) {
        this.captureError(error, { ...context, message, level: LogLevels.WARN });
      } else if (error) {
        this.captureError(error, { ...context, message, level: LogLevels.WARN });
      } else if (message) {
        this.captureMessage(message, { ...context, message, level: LogLevels.WARN });
      }
    }
  }

  public errorUnsafe(data: unknown, message: string, context?: types.CaptureContext): void;
  public errorUnsafe(data: unknown, context?: Record<string, unknown>): void;
  /**
   * A variation of the {@link error} method that can be used when we are not 100% sure that the
   * error object is in fact a {@link LoggerError}.  This is primarily to satisfy TypeScript's
   * {@link unknown} typing in catch clauses.
   */
  public errorUnsafe(
    data: unknown,
    message?: string | types.CaptureContext,
    context?: types.CaptureContext,
  ): void {
    if (!types.isLoggerError(data)) {
      throw new TypeError(getNonErrorObjectSanitizedErrorMessage(data));
    }
    if (typeof message === "string") {
      return this.error(data, message, context);
    }
    return this.error(data, message);
  }

  public error(data: types.LoggerError, message: string, context?: types.CaptureContext): void;
  public error(data: types.LoggerError | string, context?: types.CaptureContext): void;
  public error(data: types.CaptureContext): void;
  /**
   * Logs an error message, {@link string}, error object, {@link LoggerError}, or combination of
   * both, with a log level "error", via the {@link NextLogger} instance.
   *
   * The method will optionally dispatch the {@link LoggerError} or message, {@link string}, to
   * Sentry depending on the 'capture' option provided in the {@link types.CaptureContext}.
   *
   * The various function signatures on the method allow it to be used in different contexts, which
   * are as follows:
   *
   * 1. logger.error(error: LoggerError, message: string, context?: types.CaptureContext);
   * 2. logger.error(error: LoggerError, context?: types.CaptureContext);
   * 3. logger.error(message: string, context?: types.CaptureContext);
   * 4. logger.error(context: types.CaptureContext);
   *
   * @param {LoggerError | string} data
   *   Either an {@link LoggerError} object or a {@link string} message that should be logged.  If
   *   an {@link LoggerError} object is provided, the {@link string} message can be optionally
   *   provided as the second argument.
   *
   * @param {string | types.CaptureContext} msg
   *   Either a {@link string} message that should be logged (in the case that the first argument
   *   is an {@link LoggerError} object) or the {@link types.CaptureContext} that includes options
   *   and additional context that shoudl be logged with the message (in the case that the first
   *   argument is a {@link string} message).
   *
   *   See {@link types.CaptureContext} for more information.
   *
   * @param {CaptureContext} ctx
   *   The `context` argument is optional and can be used to both provide options to the method and
   *   to provide additional context to the data that is logged.  If the 'capture' option is
   *   not specified as 'false', the log message and/or error will be dispatched to Sentry.
   *
   *   @example
   *   ```ts
   *   // Dispatches error and message to Sentry.  The User's ID will be included in the log
   *   // context.
   *   logger.error(e, "An error occurred when the user logged in!", { user: user.id })
   *   ```
   *
   *   @example
   *   ```ts
   *   // Does not dispatch error and message to Sentry.  The User's ID will be included in the log
   *   // context.
   *   logger.error(e, "An error occurred when the user logged in!", {
   *     user: user.id,
   *     capture: false
   *   })
   *   ```
   */
  public error(
    data: types.LoggerError | string | types.CaptureContext,
    msg?: string | types.CaptureContext,
    ctx?: types.CaptureContext,
  ): void {
    const { error, message, context, options } = this.parseErrorArgs(data, msg, ctx);
    this.log("error", message ?? error?.message, context ?? {});

    /* If the 'capture' option is specified, either send the LoggerError to Sentry (if it is
       provided) or send the message to Sentry. */
    if (options.capture) {
      if (error && message) {
        this.captureError(error, { ...context, message, level: LogLevels.ERROR });
      } else if (error) {
        this.captureError(error, { ...context, level: LogLevels.ERROR });
      } else if (message) {
        this.captureMessage(message, { ...context, level: LogLevels.ERROR });
      }
    }
  }

  public info(message: string, context?: Record<string, unknown>): void;
  public info(context: Record<string, unknown>): void;
  /**
   * Logs an info message, {@link string}, set of contextual data, {@link Record<string, unknown>},
   * or a combination of both, with a log level "info", via the {@link NextLogger} instance.
   */
  public info(message: string | Record<string, unknown>, context?: Record<string, unknown>): void {
    if (typeof message === "string") {
      this.log("info", message, context);
    } else {
      this.log("info", message);
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void;
  public debug(context: Record<string, unknown>): void;
  /**
   * Logs an debug message, {@link string}, set of contextual data, {@link Record<string, unknown>},
   * or a combination of both, with a log level "debug", via the {@link NextLogger} instance.
   */
  public debug(message: string | Record<string, unknown>, context?: Record<string, unknown>): void {
    if (typeof message === "string") {
      this.log("debug", message, context);
    } else {
      this.log("debug", message);
    }
  }
}
