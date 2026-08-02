import type * as types from './types';

import {
  type EnvironmentName,
  EnvironmentNames,
  type LogLevel,
  LogLevels,
} from '~/environment/constants';

export const DEFAULT_LOG_LEVELS: Record<EnvironmentName, LogLevel> = {
  [EnvironmentNames.LOCAL]: LogLevels.DEBUG,
  [EnvironmentNames.PREVIEW]: LogLevels.INFO,
  [EnvironmentNames.PRODUCTION]: LogLevels.INFO,
  [EnvironmentNames.TEST]: LogLevels.DEBUG,
};

export const DEFAULT_PRETTY_LOGGING: Record<EnvironmentName, boolean> = {
  local: true,
  preview: false,
  production: false,
  test: true,
};

export const DEFAULT_LOGGING_TRANSPORTS: Record<EnvironmentName, types.NextLoggerTransport[]> = {
  local: ['browser'],
  preview: ['sentry', 'browser'],
  production: ['sentry'],
  test: [],
};
