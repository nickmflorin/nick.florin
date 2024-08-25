import { type EnumeratedLiteralsMember, enumeratedLiterals } from "enumerated-literals";

import { createCommaSeparatedArraySchema } from "./util";

export const PrismaLogLevels = enumeratedLiterals(["info", "query", "warn", "error"] as const, {});
export type PrismaLogLevel = EnumeratedLiteralsMember<typeof PrismaLogLevels>;

export const PrismaLogLevelSchema = createCommaSeparatedArraySchema({
  options: PrismaLogLevels.members,
  partTransformer: v => v.toLowerCase(),
});

export const EnvironmentNames = enumeratedLiterals(
  ["test", "local", "development", "production", "preview"] as const,
  {},
);
export type EnvironmentName = EnumeratedLiteralsMember<typeof EnvironmentNames>;

export const LogLevels = enumeratedLiterals(
  ["fatal", "error", "info", "warn", "debug", "trace", "silent"] as const,
  {},
);
export type LogLevel = EnumeratedLiteralsMember<typeof LogLevels>;

export const DEFAULT_LOG_LEVELS: { [key in EnvironmentName]: LogLevel } = {
  development: "info",
  production: "info",
  test: "debug",
  local: "debug",
  preview: "info",
};

export const DEFAULT_PRETTY_LOGGING: Record<EnvironmentName, boolean> = {
  development: false,
  production: false,
  preview: false,
  test: true,
  local: true,
};
