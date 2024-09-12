import type * as types from "./types";

import {
  LogLevels,
  type EnvironmentName,
  EnvironmentNames,
  type LogLevel,
} from "~/environment/constants";

export const DEFAULT_LOG_LEVELS: { [key in EnvironmentName]: LogLevel } = {
  [EnvironmentNames.PRODUCTION]: LogLevels.INFO,
  [EnvironmentNames.TEST]: LogLevels.DEBUG,
  [EnvironmentNames.LOCAL]: LogLevels.DEBUG,
  [EnvironmentNames.PREVIEW]: LogLevels.INFO,
};

export const DEFAULT_PRETTY_LOGGING: Record<EnvironmentName, boolean> = {
  production: false,
  preview: false,
  test: true,
  local: true,
};

export const DEFAULT_LOGGING_TRANSPORTS: Record<EnvironmentName, types.NextLoggerTransport[]> = {
  production: ["sentry"],
  preview: ["sentry", "browser"],
  test: [],
  local: ["browser"],
};
