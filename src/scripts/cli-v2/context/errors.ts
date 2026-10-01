/**
 * Raised when the environment a command was invoked in cannot support it — a missing credential, or
 * a combination of environment values that would make the run write the wrong thing somewhere.
 *
 * It is distinct from Clipanion's `UsageError`, which reports a mistake in what the operator typed.
 * This reports a mistake in how the shell they typed it into is configured.
 */
export class CliEnvironmentError extends Error {}
