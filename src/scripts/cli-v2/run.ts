import { format } from 'node:util';

const writeToStandardError = (...args: unknown[]): void => {
  process.stderr.write(`${format(...args)}\n`);
};

/**
 * Routes the console's informational methods to standard error, so that standard output carries
 * nothing but what a command writes to it deliberately — a rendered change set, or the single JSON
 * document an agent parses.
 *
 * Modules that log when they are imported, such as the Prisma client announcing its initialization,
 * would otherwise write into that output before any command has run. The CLI is therefore loaded
 * only after the console is rerouted, through a dynamic import that cannot be hoisted above it.
 */
const routeConsoleToStandardError = (): void => {
  Object.assign(console, {
    debug: writeToStandardError,
    info: writeToStandardError,
    log: writeToStandardError,
  });
};

routeConsoleToStandardError();

void import('./cli').then(({ buildCli }) => buildCli().runExit(process.argv.slice(2)));
