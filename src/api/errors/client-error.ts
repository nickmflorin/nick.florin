import { BaseHttpError, type BaseHttpErrorConfig } from "./http-error";

export class ClientError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends BaseHttpError<C> {
  public static reconstruct = (response: Response, message?: string) =>
    new ClientError({
      statusCode: response.status,
      url: response.url,
      message: message ?? response.statusText,
    });
}
