import { BaseHttpError, type HttpErrorConfig } from "./http-error";

export class ServerError extends BaseHttpError {
  constructor(config: string | Omit<HttpErrorConfig, "statusCode">) {
    super(
      typeof config === "string"
        ? { message: config, statusCode: 500 }
        : { ...config, statusCode: 500 },
    );
  }

  public get message() {
    if (this._message) {
      return this._message;
    }
    return "There was an error communicating with the server.";
  }
}
