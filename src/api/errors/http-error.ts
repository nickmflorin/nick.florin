import {
  BaseError,
  type BaseErrorConfig,
  type DefaultErrorMessage,
} from "~/application/errors/base-error";

export type BaseHttpErrorConfig<S extends number = number> = BaseErrorConfig & {
  readonly url?: string;
  readonly statusCode?: S;
};

const withDetail = (message: string, detail?: string): string =>
  detail ? `${message}: ${detail}` : `${message}.`;

const internalMessage = <C extends BaseHttpErrorConfig>(c: C) => {
  if (c.statusCode && c.url) {
    return withDetail(
      `[${c.statusCode}] There was an error with the request to ${c.url}`,
      c.internalMessage,
    );
  } else if (c.url && !c.statusCode) {
    return withDetail(
      `There was an error with the request to ${c.url}`,
      c.internalMessage ?? c.message,
    );
  } else if (c.statusCode) {
    return withDetail(
      `[${c.statusCode}] There was an error with the request`,
      c.internalMessage ?? c.message,
    );
  }
  return withDetail("There was an error with the request", c.internalMessage ?? c.message);
};

export abstract class BaseHttpError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends BaseError<C> {
  protected readonly defaultMessage: DefaultErrorMessage<C> = () =>
    "There was an error with the request.";

  constructor(config: BaseHttpErrorConfig & C) {
    super({ ...config, internalMessage: internalMessage(config) });
  }

  public get statusCode(): C["statusCode"] {
    return this._config.statusCode;
  }

  public get url(): C["url"] {
    return this._config.url;
  }
}
