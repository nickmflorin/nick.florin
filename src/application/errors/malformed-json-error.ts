import { BaseHttpError } from "./http-error";

export class MalformedJsonError extends BaseHttpError {
  protected readonly defaultMessage = (e: BaseHttpError) =>
    `Corrupted API response received for fetch at URL '${e.url}'!`;
}
