import { Builtins, Cli, type CommandClass } from 'clipanion';

/**
 * Every command the CLI exposes.
 *
 * Registration is a single list rather than a directory scan so that the set of commands is
 * knowable by reading one file, and so that adding a command is a compile-time change rather than
 * a filesystem convention that fails silently when it is not followed.
 */
const Commands: readonly CommandClass[] = [];

export const buildCli = (): Cli => {
  const cli = new Cli({
    binaryLabel: 'nick.florin',
    binaryName: 'pnpm cli',
  });
  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);
  for (const command of Commands) {
    cli.register(command);
  }
  return cli;
};
