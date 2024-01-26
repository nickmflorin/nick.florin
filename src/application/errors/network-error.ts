import { BaseHttpError, type HttpErrorConfig } from "./http-error";

export class NetworkError extends BaseHttpError {
  constructor(config: string | Omit<HttpErrorConfig, "statusCode">) {
    super(config);
  }
  public get message() {
    if (this._message) {
      return this._message;
    }
    return "There was an error communicating with the server.";
  }
}
