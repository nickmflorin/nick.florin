import { ApiClientErrorCodes } from "../codes";
import { type MessageParams } from "../types";

import { BaseHttpError, type BaseHttpErrorConfig } from "./http-error";

const getMessageForStatus = (status: number) => {
  /* Before we use the generic 'statusText' on the response as the message, we should try to
     find a more specific, user-facing message that is associated with the potential status code
     of the response. */
  const defaultModel = ApiClientErrorCodes.models.find(m => m.statusCode === status);
  if (defaultModel) {
    return defaultModel.message;
  }
  return undefined;
};

export class ClientError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends BaseHttpError<C> {
  public static reconstruct = (response: Response, message?: string | MessageParams) => {
    /* Before we use the generic 'statusText' on the response as the message, we should try to
       find a more specific, user-facing message that is associated with the potential status code
       of the response. */
    const messages: MessageParams = {
      internal:
        typeof message === "string"
          ? response.statusText
          : typeof message?.internal === "string"
            ? message.internal
            : response.statusText,
      public:
        typeof message === "string"
          ? message
          : typeof message?.public === "string"
            ? message.public
            : getMessageForStatus(response.status),
    };
    return new ClientError({
      statusCode: response.status,
      url: response.url,
      message: messages.public,
      internalMessage: messages.internal,
    });
  };
}
