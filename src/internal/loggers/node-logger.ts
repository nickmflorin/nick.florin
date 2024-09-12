import { type LoggerOptions, type DestinationStream } from "pino";

import { AbstractLogger } from "./abstract-logger";
import { type AbstractLoggerConfig } from "./types";

export type LoggerConfig = AbstractLoggerConfig;

export class Logger extends AbstractLogger {
  static create(name: string, config: LoggerConfig): Logger {
    return new Logger(name, config);
  }

  protected get config(): LoggerOptions {
    return { level: this.level, base: this.context };
  }

  protected get stream(): DestinationStream | null {
    return null;
  }

  public error(message: string, context?: object): void;
  public error(context: object): void;
  public error(message: string | object, context?: object): void {
    if (typeof message === "string") {
      this.log("error", message, context);
    } else {
      this.log("error", message);
    }
  }

  public warn(message: string, context?: object): void;
  public warn(context: object): void;
  public warn(message: string | object, context?: object): void {
    if (typeof message === "string") {
      this.log("warn", message, context);
    } else {
      this.log("warn", message);
    }
  }

  public info(message: string, context?: object): void;
  public info(context: object): void;
  public info(message: string | object, context?: object): void {
    if (typeof message === "string") {
      this.log("info", message, context);
    } else {
      this.log("info", message);
    }
  }

  public debug(message: string, context?: object): void;
  public debug(context: object): void;
  public debug(message: string | object, context?: object): void {
    if (typeof message === "string") {
      this.log("debug", message, context);
    } else {
      this.log("debug", message);
    }
  }
}
