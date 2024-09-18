import { ApiClientGlobalErrorCodes, type ApiClientGlobalErrorCode } from "../codes";
import { type ApiClientGlobalErrorJson } from "../types";

import {
  AbstractApiClientError,
  type AbstractApiClientErrorConfig,
} from "./abstract-api-client-error";
import { removeUndefined } from "./util";

export class ApiClientGlobalError extends AbstractApiClientError<ApiClientGlobalErrorJson> {
  public static fromJson = (json: ApiClientGlobalErrorJson): ApiClientGlobalError =>
    new ApiClientGlobalError({
      status: json.status,
      code: json.code,
      message: json.message,
    });

  public static reconstruct = (
    response: Response,
    params?: Pick<AbstractApiClientErrorConfig, "message" | "method">,
  ) => {
    let msg: string;
    let code: ApiClientGlobalErrorCode = ApiClientGlobalErrorCodes.UNKNOWN;
    if (!params?.message) {
      const errorCodeModel = ApiClientGlobalErrorCodes.models.find(
        m => m.status === response.status,
      );
      if (errorCodeModel) {
        msg = errorCodeModel.message;
        code = errorCodeModel.value;
      } else {
        msg = response.statusText;
      }
    } else {
      msg = params.message;
    }
    return new ApiClientGlobalError({
      status: response.status,
      code,
      url: response.url,
      message: msg,
      method: params?.method,
    });
  };

  public static UnknownError = (config: Omit<AbstractApiClientErrorConfig, "code">) =>
    new ApiClientGlobalError({
      ...config,
      code: ApiClientGlobalErrorCodes.UNKNOWN,
    });

  protected static KnownError = (
    code: Exclude<ApiClientGlobalErrorCode, typeof ApiClientGlobalErrorCodes.UNKNOWN>,
    config: Omit<AbstractApiClientErrorConfig, "status" | "code">,
  ) =>
    new ApiClientGlobalError({
      ...config,
      code,
      status: ApiClientGlobalErrorCodes.getAttribute(code, "status"),
    });

  public static BadRequest = (config: Omit<AbstractApiClientErrorConfig, "code" | "status">) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.BAD_REQUEST, config);

  public static InternalServer = (config: Omit<AbstractApiClientErrorConfig, "code" | "status">) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.INTERNAL_SERVER, config);

  public static NotAuthenticated = (
    config: Omit<AbstractApiClientErrorConfig, "code" | "status">,
  ) => ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.NOT_AUTHENTICATED, config);

  public static Forbidden = (config: Omit<AbstractApiClientErrorConfig, "code" | "status">) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.FORBIDDEN, config);

  public static NotFound = (config: Omit<AbstractApiClientErrorConfig, "code" | "status">) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.NOT_FOUND, config);

  public get json() {
    if (this.code === ApiClientGlobalErrorCodes.UNKNOWN) {
      throw new Error("A global error with an 'UNKNOWN' code is not allowed to be serialized!");
    }
    return removeUndefined({
      status: this.status,
      code: this.code,
      message: this.message,
    });
  }
}
