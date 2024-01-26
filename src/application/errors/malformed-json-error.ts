import { BaseHttpError } from "./http-error";

export class MalformedJsonError extends BaseHttpError {
  public get message() {
    if (this._message) {
      return this._message;
    }
    return `Corrupted API response received for fetch at URL '${this.url}'!`;
  }
}
