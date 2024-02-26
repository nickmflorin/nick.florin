import { BaseError, type BaseErrorConfig, type DefaultErrorMessage } from "./base-error";

export type BaseHttpErrorConfig = BaseErrorConfig & {
  readonly url?: string;
  readonly statusCode?: number;
  readonly internalMessageDetail?: string;
};

const withDetail = (message: string, detail?: string): string =>
  detail ? `${message}: ${detail}` : `${message}.`;

export abstract class BaseHttpError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends BaseError<C> {
  protected readonly defaultMessage: DefaultErrorMessage<C> = () =>
    "There was an error with the request.";
  protected readonly defaultInternalMessage: DefaultErrorMessage<C> = (c: C) =>
    c.statusCode && c.url
      ? withDetail(
          `[${c.statusCode}] There was an error with the request to ${c.url}`,
          c.internalMessageDetail,
        )
      : c.url
        ? withDetail(`There was an error with the request to ${c.url}`, c.internalMessageDetail)
        : c.statusCode
          ? withDetail(
              `[${c.statusCode}] There was an error with the request to ${c.url}`,
              c.internalMessageDetail,
            )
          : withDetail("There was an error with the request", c.internalMessageDetail);

  public readonly url: C["url"];
  protected readonly _statusCode: C["statusCode"];

  constructor(config: C) {
    super(config);
    this.url = config.url;
    this._statusCode = config.statusCode;
  }

  public get statusCode(): C["statusCode"] {
    return this._statusCode;
  }
}
