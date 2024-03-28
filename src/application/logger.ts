import { DateTime } from "luxon";
import pino, { type LoggerOptions, levels } from "pino";
import { logflarePinoVercel } from "pino-logflare";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { type LogLevel, LogLevels, environment } from "~/environment";

import * as terminal from "./support/terminal";
import { isolateVariableFromHotReload } from "./util";

const LogLevelColors: { [key in LogLevel | "log"]: string } = {
  fatal: terminal.RED,
  error: terminal.RED,
  warn: terminal.YELLOW,
  info: terminal.CYAN,
  debug: terminal.GRAY,
  trace: terminal.BLUE,
  log: terminal.GRAY,
  silent: terminal.GRAY,
};

const _parseLevel = (o: object): LogLevel | "log" | null => {
  if ("level" in o && typeof o.level === "number") {
    const l = levels.labels[o.level];
    if (LogLevels.contains(l) || l === "log") {
      return l;
    }
  }
  return null;
};

type LogContext = { level: LogLevel | "log"; message: string; time: DateTime };

const formatters: { [key in keyof LogContext]: (v: LogContext[key]) => string } = {
  level: level => {
    if (environment.get("NEXT_PUBLIC_PRETTY_LOGGING")) {
      return `[${LogLevelColors[level] + level.toUpperCase() + terminal.RESET}]`;
    }
    return `[${level.toUpperCase()}]`;
  },
  message: message => message,
  time: dt => {
    if (environment.get("NEXT_PUBLIC_PRETTY_LOGGING")) {
      return `[${terminal.BLUE + dt.toFormat("LLL dd yyyy HH:mm:ss") + terminal.RESET}]`;
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

/* eslint-disable no-console */
const ConsoleWriters: { [key in LogLevel | "log"]: typeof console.log } = {
  fatal: console.error,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
  log: console.log,
  silent: console.debug,
};
/* eslint-enable no-console */

const formatContext = (context: Partial<LogContext>): string =>
  [
    context.time || context.level
      ? [
          context.time ? formatters.time(context.time) : undefined,
          context.level ? formatters.level(context.level) : undefined,
        ]
          .filter(v => v !== undefined)
          .join(" ") + (context.message ? ":" : "")
      : undefined,
    context.message ? formatters.message(context.message) : undefined,
  ].join(" ");

const parseLogContext = (o: object): [string, object] => {
  const context: Partial<LogContext> = {};
  for (const k of Object.keys(parsers)) {
    const key = k as keyof typeof parsers;
    parsers[key](context, o);
  }
  return [formatContext(context), o];
};

const initializeLogger = () => {
  /* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
  const loggerOptions: LoggerOptions = {
    browser: {
      write: o => {
        const level = _parseLevel(o);
        const writer = level ? ConsoleWriters[level] : ConsoleWriters.info;
        const [message, obj] = parseLogContext(o);
        if (Object.keys(obj).length !== 0) {
          writer(message, obj);
        } else {
          writer(message);
        }
      },
    },
    level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
    base: {
      env: process.env.NODE_ENV,
      revision: environment.get("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"),
      instance: uuid(),
    },
  };
  if (
    typeof window === "undefined" &&
    environment.get("NEXT_PUBLIC_PRETTY_LOGGING") === true &&
    process.env.VERCEL_ENV !== "production"
  ) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const pretty = require("pino-pretty");
    return pino(loggerOptions, pretty({ colorize: true }));
  } else if (
    process.env.VERCEL_ENV &&
    ["preview", "production"].includes(process.env.VERCEL_ENV) &&
    process.env.NODE_ENV !== "test"
  ) {
    /* eslint-disable-next-line no-console */
    console.info("THIS IS A TEMPORARY LOG TO LET US KNOW WE ARE USING LOGFARE");
    const [apiKey, sourceToken] = [
      environment.get("LOGFLARE_API_KEY"),
      environment.get("LOGFLARE_SOURCE_TOKEN"),
    ];
    if (!apiKey || !sourceToken) {
      // TODO: Consolidate this with a call to environment.throwConfigurationError!
      throw new Error(
        `Missing Logflare API Key or Source Token for VERCEL_ENV=${process.env.VERCEL_ENV}, ` +
          `NODE_ENV=${process.env.NODE_ENV}!`,
      );
    }
    const { stream, send } = logflarePinoVercel({
      apiKey,
      sourceToken,
    });
    return pino(
      {
        ...loggerOptions,
        browser: {
          ...loggerOptions.browser,
          transmit: {
            level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
            send,
          },
        },
      },
      stream,
    );
  }
  return pino(loggerOptions);
};

export const logger = isolateVariableFromHotReload("logger", initializeLogger);
