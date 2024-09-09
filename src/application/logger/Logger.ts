import pino, {
  type LoggerOptions,
  type DestinationStream,
  type LogEvent,
  type Level,
  multistream,
} from "pino";
import { logflarePinoVercel } from "pino-logflare";
import { v4 as uuid } from "uuid";

import { environment } from "~/environment";

import { browserWriter } from "./browser-writer";

const __NOT_SET__ = "__NOT_SET__" as const;
type NotSet = typeof __NOT_SET__;

export class Logger {
  private readonly instance: string;
  private _pino: pino.Logger | null = null;
  private _prettyStream: DestinationStream | NotSet | null = __NOT_SET__;
  private _logflareStream:
    | {
        stream: DestinationStream;
        send: (level: number | Level, logEvent: LogEvent) => void;
      }
    | NotSet
    | null = __NOT_SET__;

  constructor() {
    this.instance = uuid();
  }

  private get env() {
    return process.env.NODE_ENV;
  }

  private get vercelEnv() {
    return process.env.VERCEL_ENV;
  }

  private get prettyStream() {
    if (this._prettyStream === __NOT_SET__) {
      if (typeof window === "undefined" && environment.get("NEXT_PUBLIC_PRETTY_LOGGING") === true) {
        /* eslint-disable-next-line @typescript-eslint/no-var-requires */
        const pretty = require("pino-pretty");
        return pretty({ colorize: true, sync: true });
      }
      return null;
    }
    return this._prettyStream;
  }

  private get logflareStream() {
    if (this._logflareStream === __NOT_SET__) {
      if (
        this.vercelEnv &&
        ["preview", "production"].includes(this.vercelEnv) &&
        /* This check may not be necessary?  Not sure if running tests during builds will trigger
         this. */
        this.env !== "test"
      ) {
        const [apiKey, sourceToken] = [
          environment.get("LOGFLARE_API_KEY"),
          environment.get("LOGFLARE_SOURCE_TOKEN"),
        ];
        if (!apiKey || !sourceToken) {
          return environment.throwConfigurationError([
            !apiKey ? { field: "LOGFLARE_API_KEY" } : null,
            !sourceToken ? { field: "LOGFLARE_SOURCE_TOKEN" } : null,
          ]);
        }
        const { stream, send } = logflarePinoVercel({
          apiKey,
          sourceToken,
        });
        return { stream, send };
      }
      return null;
    }
    return this._logflareStream;
  }

  private get stream() {
    // Multi-stream only works on the server.
    if (typeof window === "undefined" && this.logflareStream && this.prettyStream) {
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info("Configuring logger for logflare logging and pretty logging...");
      return multistream([this.prettyStream, this.logflareStream]);
    } else if (this.logflareStream) {
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info("Configuring logger for logflare logging...");
      return this.logflareStream;
    } else if (this.prettyStream) {
      /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
      console.info("Configuring logger for pretty logging...");
      return this.prettyStream;
    }
    return null;
  }

  private get config(): LoggerOptions {
    return {
      browser: {
        write: browserWriter,
        asObject: true,
        transmit: this.logflareStream
          ? {
              level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
              send: this.logflareStream.send,
            }
          : undefined,
      },
      level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
      base: {
        env: this.env,
        revision: environment.get("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"),
        instance: this.instance,
      },
    };
  }

  private get pino() {
    if (!this._pino) {
      this._pino = pino(this.config, this.stream ?? undefined);
    }
    return this._pino;
  }

  public warn(message: string, context?: object, ...args: any[]): void {
    if (context !== undefined) {
      this.pino.warn(context, message, ...args);
    } else {
      this.pino.warn(message, ...args);
    }
  }

  public error(message: string, context?: object, ...args: any[]): void {
    if (context !== undefined) {
      this.pino.error(context, message, ...args);
    } else {
      this.pino.error(message, ...args);
    }
  }

  public info(message: string, context?: object, ...args: any[]): void {
    if (context !== undefined) {
      this.pino.info(context, message, ...args);
    } else {
      this.pino.info(message, ...args);
    }
  }

  public debug(message: string, context?: object, ...args: any[]): void {
    if (context !== undefined) {
      this.pino.debug(context, message, ...args);
    } else {
      this.pino.debug(message, ...args);
    }
  }
}
