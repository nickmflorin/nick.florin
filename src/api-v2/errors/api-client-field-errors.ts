import { type z } from "zod";

import { logger } from "~/internal/logger";

import { type ApiClientFieldErrorCode, ApiClientFieldErrorCodes } from "../codes";
import {
  type ApiClientFieldErrorsObj,
  type RawApiClientFieldErrorsObj,
  type ApiClientFieldError,
  type RawApiClientFieldError,
  isZodError,
  type RawApiClientFieldErrorObj,
} from "../types";

import { ApiClientFormError } from "./api-client-form-error";

export const parseZodError = (error: z.ZodError): RawApiClientFieldErrorsObj =>
  error.issues.reduce(
    (acc, issue) => ({
      ...acc,
      [issue.path.join(".")]: {
        code: ApiClientFieldErrorCodes.invalid,
        internalMessage: issue.message,
      },
    }),
    {} as RawApiClientFieldErrorsObj,
  );

/* When a single error is added to the set, it cannot be null or undefined.  However, null and/or
   undefined can still be present as an element in teh array, if provided as an array. */
type AddError = Exclude<RawApiClientFieldError, undefined | null> | RawApiClientFieldError[];

/* This type is used when the code is already assumed inside of the method, e.g. inside of the
   method named 'addUnique'. In this case, the code is already known - and does not need to be
   included in the function argument.

   So the argument can either be the RawApiClientFieldErrorObj without a code (which is just the
   message and internal message optionally), or it can be just a string message.

   In other words, the method can be called as either of the following:

   1. The field name and a single message:

      addUnique("<fieldName>", "User facing message and internal message...")

   2. The field name and an object with either or both the internal and user facing messages:

      addUnique("<fieldName>", {
        message: "User facing message...",
        internalMessage: "Internal message..."
      })

   3. The field name only:

      addUnique("<fieldName>")
   */
type AddErrorOfCode = string | Omit<RawApiClientFieldErrorObj, "code">;

export class ApiClientFieldErrors<F extends string = string> {
  private _errors: RawApiClientFieldErrorsObj<F> = {};

  constructor(errors?: RawApiClientFieldErrorsObj<F>) {
    this._errors = errors ?? {};
  }

  public static fromZodError(error: z.ZodError): ApiClientFieldErrors {
    return new ApiClientFieldErrors(parseZodError(error));
  }

  public get errors(): ApiClientFieldErrorsObj<F> {
    return Object.keys(this._errors).reduce((prev: ApiClientFieldErrorsObj<F>, key: string) => {
      const k = key as F;
      const d: RawApiClientFieldError | RawApiClientFieldError[] = this._errors[k];
      const errs = Array.isArray(d) ? d : [d];

      const processed = errs.reduce((acc: ApiClientFieldError[], e: RawApiClientFieldError) => {
        if (ApiClientFieldErrorCodes.contains(e)) {
          /* We only care about removing duplicate codes in the case that the error is provided as
             just the code.  This is because if only the code is provided, the message and internal
             message are defaulted based on the code.  This means that if the code is duplicated,
             when provided as just the code, there will be duplicate messages as well. */
          if (acc.map(a => a.code).includes(e)) {
            logger.error(`Encountered duplicate codes, '${e}', in the field errors!.`);
            return acc;
          }
          return [
            ...acc,
            {
              code: e,
              message: ApiClientFieldErrorCodes.getAttribute(e, "message")(k),
              internalMessage: ApiClientFieldErrorCodes.getAttribute(e, "message")(k),
            },
          ];
        } else if (e !== null && e !== undefined && e.conditional !== false) {
          return [
            ...acc,
            {
              ...e,
              message: e.message ?? ApiClientFieldErrorCodes.getAttribute(e.code, "message")(k),
              internalMessage:
                e.internalMessage ??
                e.message ??
                ApiClientFieldErrorCodes.getAttribute(e.code, "internalMessage")(k),
            },
          ];
        }
        return acc;
      }, []);
      if (processed.length !== 0) {
        return { ...prev, [k]: processed };
      }
      return prev;
    }, {});
  }

  public add(errors: RawApiClientFieldErrorsObj<F>): ApiClientFieldErrors<F>;

  public add<N extends F>(field: N, error: AddError): ApiClientFieldErrors<F>;

  public add(error: z.ZodError): ApiClientFieldErrors<F>;

  public add<N extends F>(field: N | RawApiClientFieldErrorsObj<F> | z.ZodError, error?: AddError) {
    if (typeof field === "string") {
      const e = error as AddError;

      const data = Array.isArray(e) ? e : [e];

      const current = this._errors[field];
      if (current === undefined) {
        this._errors[field] = data;
      } else if (Array.isArray(current)) {
        this._errors[field] = [...current, ...data];
      } else {
        this._errors[field] = [current, ...data];
      }
    } else if (isZodError(field)) {
      return this.add(parseZodError(field) as RawApiClientFieldErrorsObj<F>);
    } else {
      /* Here, we have to merge the raw field error objects together, which can be done by calling
         the method for each key-value pair in the provided object. */
      for (const key of Object.keys(field)) {
        const k = key as F;
        this.add(k, field[k] ?? []);
      }
    }
    // Return a new version of the instance to allow for chaining.
    return new ApiClientFieldErrors({ ...this.errors });
  }

  private addOfCode<N extends F>(
    field: N,
    code: ApiClientFieldErrorCode,
    error?: AddErrorOfCode,
  ): ApiClientFieldErrors<F> {
    if (typeof error === "string") {
      return this.add(field, { message: error, code });
    }
    return this.add(field, { ...error, code });
  }

  public addUnique<N extends F>(field: N, error?: AddErrorOfCode): ApiClientFieldErrors<F> {
    return this.addOfCode(field, ApiClientFieldErrorCodes.unique, error);
  }

  public addInvalid<N extends F>(field: N, error?: AddErrorOfCode): ApiClientFieldErrors<F> {
    return this.addOfCode(field, ApiClientFieldErrorCodes.invalid, error);
  }

  public addDoesNotExist<N extends F>(field: N, error?: AddErrorOfCode): ApiClientFieldErrors<F> {
    return this.addOfCode(field, ApiClientFieldErrorCodes.does_not_exist, error);
  }

  public static doesNotExist<N extends string>(
    field: N,
    error?: AddErrorOfCode,
  ): ApiClientFieldErrors<N> {
    const errs = new ApiClientFieldErrors<N>();
    return errs.addDoesNotExist(field, error);
  }

  public static invalid<N extends string>(
    field: N,
    error?: AddErrorOfCode,
  ): ApiClientFieldErrors<N> {
    const errs = new ApiClientFieldErrors<N>();
    return errs.addInvalid(field, error);
  }

  public static unique<N extends string>(
    field: N,
    error?: AddErrorOfCode,
  ): ApiClientFieldErrors<N> {
    const errs = new ApiClientFieldErrors<N>();
    return errs.addUnique(field, error);
  }

  public get isEmpty(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  public get hasErrors(): boolean {
    return Object.keys(this.errors).length !== 0;
  }

  public get error(): ApiClientFormError<F> {
    if (this.isEmpty) {
      throw new Error("Cannot convert an empty set of field errors to an error.");
    }
    return ApiClientFormError.create({ errors: this.errors });
  }

  public get response() {
    return this.error.response;
  }

  public get json() {
    return this.error.json;
  }
}
