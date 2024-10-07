export class CommandLineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandLineError";
  }
}

export class CommandLineEnvironmentError extends CommandLineError {
  constructor(message?: string) {
    super(message ?? "Invalid environment detected!");
    this.name = "CommandLineEnvironmentError";
  }
}

export class CommandLineDevOnlyError extends CommandLineError {
  constructor(message?: string) {
    super(
      message ?? "Attempting to access development-only logic in a non-development environment!",
    );
    this.name = "CommandLineDevOnlyError";
  }
}

export abstract class CommandLineArgumentError extends CommandLineError {
  constructor(message: string) {
    super(message);
    this.name = "CommandLineArgumentError";
  }
}

export class InvalidCommandLineArgumentError extends CommandLineError {
  constructor(name: string, value: string, context?: string) {
    super(
      context
        ? `Invalid value for argument '${name}': ${value}. ${context}`
        : `Invalid value for argument '${name}': ${value}.`,
    );
    this.name = "InvalidCommandLineArgumentError";
  }
}

export class MissingCommandLineArgumentError extends CommandLineError {
  constructor(name: string) {
    super(`Missing value for argument '${name}'.`);
    this.name = "MissingCommandLineArgumentError";
  }
}
