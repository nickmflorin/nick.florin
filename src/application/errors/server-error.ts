import { BaseHttpError, type BaseHttpErrorConfig } from "./http-error";

export class ServerError extends BaseHttpError<{
  statusCode: 500;
  message?: string;
  url: string;
}> {
  protected readonly defaultMessage = "There was an error communicating with the server.";

  constructor(config: string | Omit<BaseHttpErrorConfig, "statusCode">) {
    super(
      typeof config === "string"
        ? { message: config, statusCode: 500 }
        : { ...config, statusCode: 500 },
    );
  }
}
