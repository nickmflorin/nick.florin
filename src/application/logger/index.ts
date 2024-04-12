import { isolateVariableFromHotReload } from "../util";

import { Logger } from "./Logger";

const initializeLogger = () => {
  /* eslint-disable-next-line no-console -- The logger is not yet configured here. */
  console.info("Configuring logger...");
  return new Logger();
};

export const logger = isolateVariableFromHotReload("logger", initializeLogger);
