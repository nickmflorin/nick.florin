import { type DestinationStream, multistream } from "pino";

import { BaseNextLogger } from "./base-next-logger";
import { type NextLoggerConfig } from "./types";

const __NOT_SET__ = "__NOT_SET__" as const;
type NotSet = typeof __NOT_SET__;

export class NextLogger extends BaseNextLogger {
  private readonly _prettyStream: DestinationStream | NotSet | null = __NOT_SET__;

  static create(
    name: string,
    config?: Partial<Omit<NextLoggerConfig, "environment" | "vercelEnvironment">>,
  ): NextLogger {
    return new NextLogger(name, BaseNextLogger.createConfig(config));
  }

  private get prettyStream() {
    if (this._prettyStream === __NOT_SET__) {
      /* The "pino-pretty" package can only be used on the server because it relies on
         "worker_threads" - which is a NodeJS package.  This means it must be dynamically imported
         with a var-require as well... */
      if (typeof window === "undefined" && this.pretty) {
        /* We have to conditionally require the package in this manner because when on "edge"
           runtimes, the nodeJS module "pino-pretty" is not compatible.  This means that if we
           do not wrap the require in a try-catch, logging in, for instance, the middleware file,
           will break. */
        let pretty: (config: { colorize: true; sync: true }) => DestinationStream | null;
        try {
          /* eslint-disable-next-line @typescript-eslint/no-var-requires */
          pretty = require("pino-pretty");
        } catch (e) {
          return null;
        }
        return pretty({ colorize: true, sync: true });
      }
      return null;
    }
    return this._prettyStream;
  }

  protected get stream() {
    // Multi-stream only works on the server.
    if (typeof window === "undefined" && this.prettyStream) {
      return multistream([this.prettyStream]);
    }
    return null;
  }
}
