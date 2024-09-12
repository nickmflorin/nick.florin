import type * as types from "./types";
import type * as Sentry from "@sentry/nextjs";

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

// A mapping of internal log levels to Sentry's severity levels.
export const LevelSeverityLevelMap: { [key in Exclude<LogLevel, "silent">]: Sentry.SeverityLevel } =
  {
    error: "error",
    warn: "warning",
    info: "info",
    debug: "debug",
  };
