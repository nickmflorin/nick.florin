export type HttpErrorConfig = {
  readonly url?: string;
  readonly message?: string;
  readonly statusCode?: number;
};

export abstract class BaseHttpError extends Error {
  public readonly url?: string;
  public abstract message: string;
  protected readonly _message: string | undefined;
  protected readonly _statusCode: number | undefined;

  constructor(config: string | HttpErrorConfig) {
    super();
    this.url = typeof config === "string" ? undefined : config.url;
    this._statusCode = typeof config === "string" ? undefined : config.statusCode;
    this._message = typeof config === "string" ? config : config.message;
  }

  public get statusCode() {
    return this._statusCode;
  }
}
