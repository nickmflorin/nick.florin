import { isError } from '~/application/errors';

import { type ApiClientErrorJson, type ApiError, isApiClientErrorJson, isApiError } from '~/api';
import {
  type EnvironmentName,
  type LogLevel,
  type VercelEnvironmentName,
} from '~/environment/constants';

export type NextLoggerTransport = 'browser' | 'sentry';

export interface AbstractLoggerConfig {
  readonly environment: EnvironmentName;
  readonly globalContext?: Record<string, unknown>;
  readonly includeContext?: boolean;
  readonly level?: LogLevel;
  readonly vercelEnvironment?: VercelEnvironmentName;
}

export interface NextLoggerConfig extends AbstractLoggerConfig {
  readonly pretty?: boolean;
  readonly transports?:
    NextLoggerTransport[] | Partial<Record<EnvironmentName, NextLoggerTransport[]>>;
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
 */
export interface CaptureContext {
  [key: string]: unknown;
  /**
   * If not specified as 'false', the log message and/or error will be dispatched to Sentry.
   */
  readonly capture?: boolean;
}

export interface SentryCaptureContext {
  [key: string]: unknown;
  readonly level?: Exclude<LogLevel, 'silent'>;
}

export type LoggerError = ApiClientErrorJson | ApiError | Error;

export const isLoggerError = (error: unknown): error is LoggerError =>
  isError(error) || isApiError(error) || isApiClientErrorJson(error);
