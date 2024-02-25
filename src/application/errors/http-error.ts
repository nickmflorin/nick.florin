export type BaseHttpErrorConfig = {
  readonly url?: string;
  readonly message?: string;
  readonly statusCode?: number;
};

type ToConfig<C extends BaseHttpErrorConfig> = { [key in keyof BaseHttpErrorConfig]?: C[key] };

export abstract class BaseHttpError<
  C extends BaseHttpErrorConfig = BaseHttpErrorConfig,
> extends Error {
  public readonly url: C["url"];
  protected abstract readonly defaultMessage: string | ((e: BaseHttpError<C>) => string);
  protected readonly _message: C["message"];
  protected readonly _statusCode: C["statusCode"];

  constructor(config: ToConfig<C>) {
    super();

    this.url = config.url;
    this._statusCode = config.statusCode;
    this._message = config.message;
  }

  public get statusCode(): C["statusCode"] {
    return this._statusCode;
  }

  public get message(): string {
    if (this._message) {
      return this._message;
    }
    return typeof this.defaultMessage === "function"
      ? this.defaultMessage(this)
      : this.defaultMessage;
  }
}
