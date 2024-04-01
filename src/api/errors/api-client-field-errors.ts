import uniqBy from "lodash.uniqby";
import { type z } from "zod";

import { logger } from "~/application/logger";

import { ApiClientFieldErrorCodes } from "../codes";
import {
  type ApiClientFieldErrorsObj,
  type RawApiClientFieldErrorsObj,
  type ApiClientFieldError,
  type RawApiClientFieldErrorSpec,
  isZodError,
} from "../types";

import { ApiClientFormError } from ".";

export type IssueLookup<L extends string> = { [key in L]?: (issue: z.ZodIssue) => boolean };

export const parseZodError = <O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
  error: z.ZodError,
  schema: O,
  lookup?: IssueLookup<keyof O["shape"] & string>,
): RawApiClientFieldErrorsObj<keyof O["shape"] & string> => {
  const errs: RawApiClientFieldErrorsObj<keyof O["shape"] & string> = {};

  const keys = Object.values(schema.keyof().Values);
  if (keys.length === 0) {
    throw new Error("Cannot parse zod error for an empty schema!");
  }
  for (const field of keys) {
    errs[field as keyof O["shape"] & string] = uniqBy(
      error.issues
        .filter(issue => {
          const fn = lookup?.[field];
          return fn !== undefined ? fn(issue) : issue.path[0] === field;
        })
        .map(issue => ({
          code: ApiClientFieldErrorCodes.invalid,
          internalMessage: issue.message,
        })),
      err => err.code,
    );
  }
  return errs;
};

export class ApiClientFieldErrors<F extends string = string> {
  private _errors: RawApiClientFieldErrorsObj<F> = {};

  constructor(errors?: RawApiClientFieldErrorsObj<F>) {
    this._errors = errors ?? {};
  }

  public static fromZodError<O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    error: z.ZodError,
    schema: O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ): ApiClientFieldErrors<keyof O["shape"] & string> {
    return new ApiClientFieldErrors(parseZodError(error, schema, lookup));
  }

  public get errors(): ApiClientFieldErrorsObj<F> {
    return Object.keys(this._errors).reduce((prev: ApiClientFieldErrorsObj<F>, key: string) => {
      const k = key as F;
      const d: RawApiClientFieldErrorSpec | RawApiClientFieldErrorSpec[] = this._errors[k];
      const errs = Array.isArray(d) ? d : [d];

      const processed = errs.reduce((acc: ApiClientFieldError[], e: RawApiClientFieldErrorSpec) => {
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
              message: ApiClientFieldErrorCodes.getAttribute(e.code, "message")(k),
              internalMessage: ApiClientFieldErrorCodes.getAttribute(e.code, "message")(k),
              ...e,
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

  public add(errors: RawApiClientFieldErrorsObj<F>): void;

  public add<N extends F>(
    field: N,
    error: Exclude<RawApiClientFieldErrorSpec, undefined | null> | RawApiClientFieldErrorSpec[],
  ): void;

  public add<O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    error: z.ZodError,
    schema: O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ): void;

  public add<N extends F, O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
    field: N | RawApiClientFieldErrorsObj<F> | z.ZodError,
    error?:
      | Exclude<RawApiClientFieldErrorSpec, undefined | null>
      | RawApiClientFieldErrorSpec[]
      | O,
    lookup?: IssueLookup<keyof O["shape"] & string>,
  ) {
    if (typeof field === "string") {
      const e = error as
        | Exclude<RawApiClientFieldErrorSpec, undefined | null>
        | RawApiClientFieldErrorSpec[];

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
      return this.add(parseZodError(field, error as O, lookup));
    } else {
      /* Here, we have to merge the raw field error objects together, which can be done by calling
         the method for each key-value pair in the provided object. */
      for (const key of Object.keys(field)) {
        const k = key as F;
        this.add(k, field[k] ?? []);
      }
    }
  }

  public get isEmpty(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  public toError(): ApiClientFormError<F> {
    return ApiClientFormError.BadRequest(this.errors);
  }
}
