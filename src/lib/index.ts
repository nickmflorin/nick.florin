import { logger } from "~/internal/logger";

export * from "./arrays";
export * from "./dates";

export function sleep(time: number) {
  if (process.env.NODE_ENV !== "development") {
    logger.error(`Attempting to sleep for '${time}ms' in a non-development environment!`);
    return;
  }
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
