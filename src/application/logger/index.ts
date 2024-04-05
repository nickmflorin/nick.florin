import pino, { type LoggerOptions, type DestinationStream, multistream } from "pino";
import { logflarePinoVercel } from "pino-logflare";
import { v4 as uuid } from "uuid";

import { environment } from "~/environment";

import { isolateVariableFromHotReload } from "../util";

import { browserWriter } from "./browser-writer";

const initializeLogger = () => {
  /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
  console.info("Configuring logger...");
  let loggerOptions: LoggerOptions = {
    browser: {
      write: browserWriter,
    },
    level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
    base: {
      env: process.env.NODE_ENV,
      revision: environment.get("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"),
      instance: uuid(),
    },
  };

  let prettyStream: DestinationStream | undefined = undefined;
  let logflareStream: DestinationStream | undefined = undefined;

  if (typeof window === "undefined" && environment.get("NEXT_PUBLIC_PRETTY_LOGGING") === true) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const pretty = require("pino-pretty");
    prettyStream = pretty({ colorize: true, sync: true });
  }
  if (
    process.env.VERCEL_ENV &&
    ["preview", "production"].includes(process.env.VERCEL_ENV) &&
    // This check may not be necessary?  Not sure if running tests during builds will trigger this.
    process.env.NODE_ENV !== "test"
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

    logflareStream = stream;

    loggerOptions = {
      ...loggerOptions,
      browser: {
        ...loggerOptions.browser,
        transmit: {
          level: environment.get("NEXT_PUBLIC_LOG_LEVEL"),
          send,
        },
      },
    };
  }
  if (typeof window === "undefined" && logflareStream && prettyStream) {
    // Multi-stream only works on the server.
    /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
    console.info("Configuring logger for logflare logging and pretty logging...");
    return pino(loggerOptions, multistream([prettyStream, logflareStream]));
  } else if (logflareStream) {
    /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
    console.info("Configuring logger for logflare logging...");
    return pino(loggerOptions, logflareStream);
  } else if (prettyStream) {
    /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
    console.info("Configuring logger for pretty logging...");
    return pino(loggerOptions, prettyStream);
  }
  return pino(loggerOptions);
};

export const logger = isolateVariableFromHotReload("logger", initializeLogger);
