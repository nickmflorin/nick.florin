import { DateTime } from "luxon";
import { levels } from "pino";
import { z } from "zod";

import { terminal } from "~/application/support";

import {
  EnvironmentNames,
  type EnvironmentName,
  type LogLevel,
  LogLevels,
} from "~/environment/constants";

export const LogLevelColors: { [key in LogLevel | "log"]: terminal.TerminalColor } = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "gray",
  log: "gray",
  silent: "gray",
};

/* eslint-disable no-console */
export const ConsoleWriters: { [key in LogLevel | "log"]: typeof console.log } = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  log: console.log,
  silent: console.debug,
};
/* eslint-enable no-console */

const _parseLevel = (o: object): LogLevel | "log" | null => {
  if ("level" in o && typeof o.level === "number") {
    const l = levels.labels[o.level];
    if (LogLevels.contains(l) || l === "log") {
      return l;
    }
  }
  return null;
};

const _parseEnvironment = (o: object): EnvironmentName | null => {
  if ("environment" in o && EnvironmentNames.contains(o.environment)) {
    return o.environment;
  }
  return null;
};

type LogContext = {
  level: LogLevel | "log";
  message: string;
  time: DateTime;
  environment: EnvironmentName;
  name: string;
};

type LogBrowserConfig = {
  readonly name: string;
  readonly pretty: boolean;
  readonly environment: EnvironmentName;
};

const formatters: {
  [key in keyof LogContext]: (v: LogContext[key], c: LogBrowserConfig) => string;
} = {
  level: (level, { pretty }) => {
    if (pretty) {
      const colorized = terminal.applyStyles(level.toUpperCase(), {
        foreground: LogLevelColors[level],
      });
      return `[${colorized}]`;
    }
    return `[${level.toUpperCase()}]`;
  },
  message: message => message,
  environment: (environment, { pretty }) => {
    if (pretty) {
      const colorized = terminal.applyStyles(environment, { effect: "dim" });
      return `[${colorized}]`;
    }
    return `[${environment}]`;
  },
  name: (name, { pretty }) => {
    if (pretty) {
      const colorized = terminal.applyStyles(name, { foreground: "green" });
      return `[${colorized}]`;
    }
    return `[${name}]`;
  },
  time: (dt, { pretty }) => {
    if (pretty) {
      const colorized = terminal.applyStyles(dt.toFormat("LLL dd yyyy HH:mm:ss"), {
        foreground: "blue",
      });
      return `[${colorized}]`;
    }
    return `[${dt.toFormat("LLL dd yyyy HH:mm:ss")}]`;
  },
};

const parsers: { [key in keyof LogContext]: (ctx: Partial<LogContext>, o: object) => void } = {
  level: (ctx, o) => {
    const level = _parseLevel(o);
    if (level && "level" in o) {
      delete o["level"];
      ctx.level = level;
    }
  },
  environment: (ctx, o) => {
    const environment = _parseEnvironment(o);
    if (environment && "environment" in o) {
      delete o["environment"];
      ctx.environment = environment;
    }
  },
  name: (ctx, o) => {
    if ("name" in o) {
      const parsed = z.string().safeParse(o.name);
      if (parsed.success) {
        delete o["name"];
        ctx.name = parsed.data;
      }
    }
  },
  message: (ctx, o) => {
    if ("msg" in o) {
      const parsed = z.string().safeParse(o.msg);
      if (parsed.success) {
        delete o["msg"];
        ctx.message = parsed.data;
      }
    }
  },
  time: (ctx, o) => {
    if ("time" in o) {
      const parsed = z.number().int().safeParse(o.time);
      if (parsed.success) {
        const dt = DateTime.fromMillis(parsed.data);
        if (dt.isValid) {
          delete o["time"];
          ctx.time = dt;
        }
      }
    }
  },
};

const formatContext = (context: Partial<LogContext>, c: LogBrowserConfig): string =>
  [
    context.time || context.level || context.environment || context.name
      ? [
          context.name ? formatters.name(context.name, c) : undefined,
          context.time ? formatters.time(context.time, c) : undefined,
          context.level ? formatters.level(context.level, c) : undefined,
          context.environment ? formatters.environment(context.environment, c) : undefined,
        ]
          .filter(v => v !== undefined)
          .join(" ") + (context.message ? ":" : "")
      : undefined,
    context.message ? formatters.message(context.message, c) : undefined,
  ].join(" ");

const parseLogContext = (o: object, c: LogBrowserConfig): [string, object] => {
  const context: Partial<LogContext> = {};
  for (const k of Object.keys(parsers)) {
    const key = k as keyof typeof parsers;
    parsers[key](context, o);
  }
  return [formatContext(context, c), o];
};

/**
 * @typedef {(o: object) => void} BrowserWriter
 *
 * A factory function that returns a method, {@link BrowserWriter}, that is used by instances of
 * {@link Logger} to emit parsed, formatted log messages to the browser console, usually in
 * development modes.
 *
 * The returned method, {@link BrowserWriter}, is responsible for first parsing the data that is
 * included in the log function call (e.g. {@link Logger.info}) into two parts:
 *
 * 1. A human readable string message
 * 2. Contextual data
 *
 * The method then emits the message and contextual data to the browser's console.
 *
 * @param {LogBrowserConfig} config
 *   Configuration options that impact how the emitted log message is formatted and parsed.
 *
 * @returns {BrowserWriter}
 */
export const createBrowserWriter =
  (config: LogBrowserConfig) =>
  (o: object): void => {
    const level = _parseLevel(o);
    const writer = level ? ConsoleWriters[level] : ConsoleWriters.info;
    const [message, obj] = parseLogContext(o, config);
    if (Object.keys(obj).length !== 0) {
      writer(message, obj);
    } else {
      writer(message);
    }
  };
