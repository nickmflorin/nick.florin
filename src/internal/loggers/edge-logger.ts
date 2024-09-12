import { BaseNextLogger } from "./base-next-logger";
import { type NextLoggerConfig } from "./types";

export class EdgeLogger extends BaseNextLogger {
  static create(
    name: string,
    config?: Partial<Omit<NextLoggerConfig, "environment" | "vercelEnvironment">>,
  ): EdgeLogger {
    return new EdgeLogger(name, BaseNextLogger.createConfig(config));
  }

  protected get stream() {
    return null;
  }
}
