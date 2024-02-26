export type BaseErrorConfig = {
  readonly message?: string;
  readonly internalMessage?: string;
};

export type DefaultErrorMessage<C extends BaseErrorConfig = BaseErrorConfig> =
  | string
  | ((e: C) => string);

export abstract class BaseError<C extends BaseErrorConfig = BaseErrorConfig> extends Error {
  protected abstract readonly defaultMessage: DefaultErrorMessage<C>;
  protected abstract readonly defaultInternalMessage?: DefaultErrorMessage<C>;
  protected readonly _config: C;

  constructor(config: C) {
    super();
    this._config = config;
  }

  public get internalMessage(): string {
    if (this._config["internalMessage"]) {
      return this._config["internalMessage"];
    }
    return typeof this.defaultInternalMessage === "function"
      ? this.defaultInternalMessage(this._config)
      : this.defaultInternalMessage ?? this.message;
  }

  public get message(): string {
    if (this._config["message"]) {
      return this._config["message"];
    }
    return typeof this.defaultMessage === "function"
      ? this.defaultMessage(this._config)
      : this.defaultMessage;
  }
}
