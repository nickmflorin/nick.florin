import { BaseNextLogger } from './base-next-logger';
import { type NextLoggerConfig } from './types';

export class EdgeLogger extends BaseNextLogger {
  protected readonly stream = null;

  static create(
    name: string,
    config?: Partial<Omit<NextLoggerConfig, 'environment' | 'vercelEnvironment'>>,
  ): EdgeLogger {
    return new EdgeLogger(name, BaseNextLogger.createConfig(config));
  }
}
