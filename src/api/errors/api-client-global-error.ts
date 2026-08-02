import { type ApiClientGlobalErrorCode, ApiClientGlobalErrorCodes } from '../codes';
import { type ApiClientGlobalErrorJson } from '../types';

import {
  AbstractApiClientError,
  type AbstractApiClientErrorConfig,
} from './abstract-api-client-error';
import { removeUndefined } from './util';

export class ApiClientGlobalError extends AbstractApiClientError<ApiClientGlobalErrorJson> {
  public static BadRequest = (config: Omit<AbstractApiClientErrorConfig, 'code' | 'status'>) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.BAD_REQUEST, config);
  public static Forbidden = (config: Omit<AbstractApiClientErrorConfig, 'code' | 'status'>) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.FORBIDDEN, config);
  public static fromJson = (json: ApiClientGlobalErrorJson): ApiClientGlobalError =>
    new ApiClientGlobalError({
      code: json.code,
      message: json.message,
      status: json.status,
    });
  public static InternalServer = (config: Omit<AbstractApiClientErrorConfig, 'code' | 'status'>) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.INTERNAL_SERVER, config);
  protected static KnownError = (
    code: Exclude<ApiClientGlobalErrorCode, typeof ApiClientGlobalErrorCodes.UNKNOWN>,
    config: Omit<AbstractApiClientErrorConfig, 'code' | 'status'>,
  ) =>
    new ApiClientGlobalError({
      ...config,
      code,
      status: ApiClientGlobalErrorCodes.getAttribute(code, 'status'),
    });
  public static NotAuthenticated = (
    config: Omit<AbstractApiClientErrorConfig, 'code' | 'status'>,
  ) => ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.NOT_AUTHENTICATED, config);
  public static NotFound = (config: Omit<AbstractApiClientErrorConfig, 'code' | 'status'>) =>
    ApiClientGlobalError.KnownError(ApiClientGlobalErrorCodes.NOT_FOUND, config);
  public static reconstruct = (
    response: Response,
    params?: Pick<AbstractApiClientErrorConfig, 'message' | 'method'>,
  ) => {
    let msg: string;
    let code: ApiClientGlobalErrorCode = ApiClientGlobalErrorCodes.UNKNOWN;
    if (params?.message) {
      msg = params.message;
    } else {
      const errorCodeModel = ApiClientGlobalErrorCodes.models.find(
        m => m.status === response.status,
      );
      if (errorCodeModel) {
        msg = errorCodeModel.message;
        code = errorCodeModel.value;
      } else {
        msg = response.statusText;
      }
    }
    return new ApiClientGlobalError({
      code,
      message: msg,
      method: params?.method,
      status: response.status,
      url: response.url,
    });
  };
  public static UnknownError = (config: Omit<AbstractApiClientErrorConfig, 'code'>) =>
    new ApiClientGlobalError({
      ...config,
      code: ApiClientGlobalErrorCodes.UNKNOWN,
    });

  public get json() {
    if (this.code === ApiClientGlobalErrorCodes.UNKNOWN) {
      throw new Error("A global error with an 'UNKNOWN' code is not allowed to be serialized!");
    }
    return removeUndefined({
      code: this.code,
      message: this.message,
      status: this.status,
    });
  }
}
