import { DateTime } from "luxon";
import { levels } from "pino";
import { z } from "zod";

import { type LogLevel, LogLevels, environment } from "~/environment";

import * as terminal from "../support/terminal";

import { LogLevelColors, ConsoleWriters } from "./constants";

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

export const browserWriter = (o: object): void => {
  const level = _parseLevel(o);
  const writer = level ? ConsoleWriters[level] : ConsoleWriters.info;
  const [message, obj] = parseLogContext(o);
  if (Object.keys(obj).length !== 0) {
    writer(message, obj);
  } else {
    writer(message);
  }
};
