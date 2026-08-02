import { type z } from 'zod';

import { logger } from '~/internal/logger';

import { type ApiClientFieldErrorCode, ApiClientFieldErrorCodes } from '../codes';
import {
  type ApiClientFieldError,
  type ApiClientFieldErrorsObj,
  isZodError,
  type RawApiClientFieldError,
  type RawApiClientFieldErrorObj,
  type RawApiClientFieldErrorsObj,
} from '../types';

import { ApiClientFormError } from './api-client-form-error';

export const parseZodError = (error: z.ZodError): RawApiClientFieldErrorsObj =>
  error.issues.reduce(
    (acc, issue) => ({
      ...acc,
      [issue.path.join('.')]: {
        code: ApiClientFieldErrorCodes.invalid,
        internalMessage: issue.message,
      },
    }),
    {} as RawApiClientFieldErrorsObj,
  );

/**
 * The error or errors that can be added to the set for a single field.  When a single error is
 * added to the set, it cannot be null or undefined.  However, null and/or undefined can still be
 * present as an element in the array, if provided as an array.
 */
type AddError = Exclude<RawApiClientFieldError, null | undefined> | RawApiClientFieldError[];

/**
 * The form of an error that can be provided to methods where the code is already assumed, such as
 * {@link ApiClientFieldErrors.addUnique}.  In these cases, the code is already known and does not
 * need to be included in the function argument.
 *
 * The argument can either be the {@link RawApiClientFieldErrorObj} without a code (which is just
 * the message and internal message, optionally), or it can be just a string message.
 *
 * In other words, such a method can be called with the field name and a single message,
 * `addUnique("<fieldName>", "User facing message and internal message...")`; with the field name
 * and an object containing either or both of the internal and user facing messages,
 * `addUnique("<fieldName>", { message: "...", internalMessage: "..." })`; or with the field name
 * only, `addUnique("<fieldName>")`.
 */
type AddErrorOfCode = Omit<RawApiClientFieldErrorObj, 'code'> | string;

/**
 * Returns whether or not the set of already processed errors contains an error with the provided
 * code.
 *
 * Duplicate codes only need to be removed in the case that the error is provided as just the code,
 * because when only the code is provided, the message and internal message are defaulted based on
 * the code.  This means that if the code is duplicated, when provided as just the code, there will
 * be duplicate messages as well.
 */
const containsDuplicateCode = (
  errors: ApiClientFieldError[],
  code: ApiClientFieldErrorCode,
): boolean => errors.map(e => e.code).includes(code);

export class ApiClientFieldErrors<F extends string = string> {
  private _errors: RawApiClientFieldErrorsObj<F> = {};

  constructor(errors?: RawApiClientFieldErrorsObj<F>) {
    this._errors = errors ?? {};
  }

  public static doesNotExist<N extends string>(
    field: N,
    error?: AddErrorOfCode,
  ): ApiClientFieldErrors<N> {
    const errs = new ApiClientFieldErrors<N>();
    return errs.addDoesNotExist(field, error);
  }

  public static fromZodError(error: z.ZodError): ApiClientFieldErrors {
    return new ApiClientFieldErrors(parseZodError(error));
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

  private addOfCode<N extends F>(
    field: N,
    code: ApiClientFieldErrorCode,
    error?: AddErrorOfCode,
  ): ApiClientFieldErrors<F> {
    if (typeof error === 'string') {
      return this.add(field, { code, message: error });
    }
    return this.add(field, { ...error, code });
  }

  public add(errors: RawApiClientFieldErrorsObj<F>): ApiClientFieldErrors<F>;

  public add<N extends F>(field: N, error: AddError): ApiClientFieldErrors<F>;

  public add(error: z.ZodError): ApiClientFieldErrors<F>;

  public add<N extends F>(field: N | RawApiClientFieldErrorsObj<F> | z.ZodError, error?: AddError) {
    if (typeof field === 'string') {
      const e = error as AddError;

      const data = Array.isArray(e) ? e : [e];

      const current: RawApiClientFieldError | RawApiClientFieldError[] | undefined =
        this._errors[field];
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
      for (const key of Object.keys(field)) {
        const k = key as F;
        this.add(k, field[k] ?? []);
      }
    }
    return new ApiClientFieldErrors({ ...this.errors });
  }

  public addDoesNotExist<N extends F>(field: N, error?: AddErrorOfCode): ApiClientFieldErrors<F> {
    return this.addOfCode(field, ApiClientFieldErrorCodes.does_not_exist, error);
  }

  public addInvalid<N extends F>(field: N, error?: AddErrorOfCode): ApiClientFieldErrors<F> {
    return this.addOfCode(field, ApiClientFieldErrorCodes.invalid, error);
  }

  public addUnique<N extends F>(field: N, error?: AddErrorOfCode): ApiClientFieldErrors<F> {
    return this.addOfCode(field, ApiClientFieldErrorCodes.unique, error);
  }

  public get error(): ApiClientFormError<F> {
    if (this.isEmpty) {
      throw new Error('Cannot convert an empty set of field errors to an error.');
    }
    return ApiClientFormError.create({ errors: this.errors });
  }

  public get errors(): ApiClientFieldErrorsObj<F> {
    return Object.keys(this._errors).reduce((prev: ApiClientFieldErrorsObj<F>, key: string) => {
      const k = key as F;
      const d: RawApiClientFieldError | RawApiClientFieldError[] = this._errors[k];
      const errs = Array.isArray(d) ? d : [d];

      const processed = errs.reduce((acc: ApiClientFieldError[], e: RawApiClientFieldError) => {
        if (ApiClientFieldErrorCodes.contains(e)) {
          if (containsDuplicateCode(acc, e)) {
            logger.error(`Encountered duplicate codes, '${e}', in the field errors!.`);
            return acc;
          }
          return [
            ...acc,
            {
              code: e,
              internalMessage: ApiClientFieldErrorCodes.getAttribute(e, 'message')(k),
              message: ApiClientFieldErrorCodes.getAttribute(e, 'message')(k),
            },
          ];
        } else if (e !== null && e !== undefined && e.conditional !== false) {
          return [
            ...acc,
            {
              ...e,
              internalMessage:
                e.internalMessage ??
                e.message ??
                ApiClientFieldErrorCodes.getAttribute(e.code, 'internalMessage')(k),
              message: e.message ?? ApiClientFieldErrorCodes.getAttribute(e.code, 'message')(k),
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

  public get hasErrors(): boolean {
    return Object.keys(this.errors).length !== 0;
  }

  public get isEmpty(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  public get json() {
    return this.error.json;
  }

  public get response() {
    return this.error.response;
  }
}
