import { type LogLevel } from "~/environment";

import * as terminal from "../support/terminal";

export const LogLevelColors: { [key in LogLevel | "log"]: string } = {
  fatal: terminal.RED,
  error: terminal.RED,
  warn: terminal.YELLOW,
  info: terminal.CYAN,
  debug: terminal.GRAY,
  trace: terminal.BLUE,
  log: terminal.GRAY,
  silent: terminal.GRAY,
};

/* eslint-disable no-console */
export const ConsoleWriters: { [key in LogLevel | "log"]: typeof console.log } = {
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
