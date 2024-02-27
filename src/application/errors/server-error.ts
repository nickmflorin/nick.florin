import { BaseHttpError } from "./http-error";

export class ServerError extends BaseHttpError<{
  statusCode: 500;
  message?: string;
  url: string;
}> {
  protected readonly defaultMessage = "There was an error communicating with the server.";

  constructor(config: { message?: string; url: string }) {
    super({
      ...config,
      statusCode: 500,
    });
  }
}
