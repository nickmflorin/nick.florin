import { NextLogger } from "./loggers/next-logger";

const initializeLogger = () => NextLogger.create("main");

let _logger: NextLogger;
if (process.env.NODE_ENV === "production") {
  _logger = initializeLogger();
} else {
  if (!(globalThis as unknown as { logger?: NextLogger }).logger) {
    (globalThis as unknown as { logger?: NextLogger }).logger = initializeLogger();
  }
  _logger = (globalThis as unknown as { logger: NextLogger }).logger;
}

export const logger = _logger;
