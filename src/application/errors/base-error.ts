export type BaseErrorConfig = {
  readonly message?: string;
  readonly internalMessage?: string;
};

export type DefaultErrorMessage<C extends BaseErrorConfig = BaseErrorConfig> =
  | string
  | ((e: C) => string);

export abstract class BaseError<C extends BaseErrorConfig = BaseErrorConfig> extends Error {
  protected abstract readonly defaultMessage: DefaultErrorMessage<C>;
  protected readonly defaultInternalMessage?: DefaultErrorMessage<C>;
  protected readonly _config: C;

  constructor(config: C) {
    super();
    this._config = config;
  }

  /**
   * An internal message that is used for logging or other internal protocols.  This message will
   * never be displayed to a user, and can contain more contextual information than the 'message'
   * attribute.
   */
  public get internalMessage(): string {
    if (this._config["internalMessage"]) {
      return this._config["internalMessage"];
    }
    return typeof this.defaultInternalMessage === "function"
      ? this.defaultInternalMessage(this._config)
      : (this.defaultInternalMessage ?? this.message);
  }

  /**
   * The user-facing message associated with the error.  All messages that are used to configure an
   * instance of {@link BaseError} or defined statically on a child class of {@link BaseError}
   * should be assumed that they are safe to display to a user in the application.
   */
  public get message(): string {
    if (this._config["message"]) {
      return this._config["message"];
    }
    return typeof this.defaultMessage === "function"
      ? this.defaultMessage(this._config)
      : this.defaultMessage;
  }
}
