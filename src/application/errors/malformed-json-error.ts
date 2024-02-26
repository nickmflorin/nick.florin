import { BaseHttpError, type BaseHttpErrorConfig } from "./http-error";

export class MalformedJsonError extends BaseHttpError {
  protected readonly defaultMessage = (e: BaseHttpErrorConfig) =>
    `Corrupted API response received for fetch at URL '${e.url}'!`;
}
