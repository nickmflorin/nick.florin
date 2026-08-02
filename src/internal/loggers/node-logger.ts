import { type DestinationStream, type LoggerOptions } from 'pino';

import { AbstractLogger } from './abstract-logger';
import { type AbstractLoggerConfig } from './types';

export type LoggerConfig = AbstractLoggerConfig;

export class Logger extends AbstractLogger {
  protected readonly stream: DestinationStream | null = null;

  static create(name: string, config: LoggerConfig): Logger {
    return new Logger(name, config);
  }

  public debug(message: string, context?: object): void;

  public debug(context: object): void;

  public debug(message: object | string, context?: object): void {
    if (typeof message === 'string') {
      this.log('debug', message, context);
    } else {
      this.log('debug', message);
    }
  }
  public error(message: string, context?: object): void;
  public error(context: object): void;

  public error(message: object | string, context?: object): void {
    if (typeof message === 'string') {
      this.log('error', message, context);
    } else {
      this.log('error', message);
    }
  }
  public info(message: string, context?: object): void;
  public info(context: object): void;

  public info(message: object | string, context?: object): void {
    if (typeof message === 'string') {
      this.log('info', message, context);
    } else {
      this.log('info', message);
    }
  }
  public warn(message: string, context?: object): void;
  public warn(context: object): void;

  public warn(message: object | string, context?: object): void {
    if (typeof message === 'string') {
      this.log('warn', message, context);
    } else {
      this.log('warn', message);
    }
  }

  protected get config(): LoggerOptions {
    return { base: this.context, level: this.level };
  }
}
