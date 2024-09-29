import { isError } from "~/application/errors";

import { isApiError, type ApiClientErrorJson, type ApiError, isApiClientErrorJson } from "~/api";
import {
  type VercelEnvironmentName,
  type EnvironmentName,
  type LogLevel,
} from "~/environment/constants";

export type NextLoggerTransport = "sentry" | "browser";

export interface AbstractLoggerConfig {
  readonly environment: EnvironmentName;
  readonly level?: LogLevel;
  readonly globalContext?: Record<string, unknown>;
  readonly vercelEnvironment?: VercelEnvironmentName;
  readonly includeContext?: boolean;
}

export interface NextLoggerConfig extends AbstractLoggerConfig {
  readonly pretty?: boolean;
  readonly transports?:
    | NextLoggerTransport[]
    | Partial<Record<EnvironmentName, NextLoggerTransport[]>>;
}

/**
 * Options that define whether or not certain log messages should also be dispatched to Sentry
 * in addition to the standard log streams the {@link EdgeLogger} is configured for.
 */
export interface CaptureOptions {
  readonly capture: boolean;
}

/**
 * Can be used to both provide options to the log method and to provide additional context to the
 * data that is logged.
 *
 * @property {boolean | undefined} capture
 *   If not specified as 'false', the log message and/or error will be dispatched to Sentry.
 */
export interface CaptureContext {
  readonly capture?: boolean;
  [key: string]: unknown;
}

export interface SentryCaptureContext {
  readonly level?: Exclude<LogLevel, "silent">;
  [key: string]: unknown;
}

export type LoggerError = Error | ApiError | ApiClientErrorJson;

export const isLoggerError = (error: unknown): error is LoggerError =>
  isError(error) || isApiError(error) || isApiClientErrorJson(error);
