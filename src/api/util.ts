import uniqBy from "lodash.uniqby";
import { type z } from "zod";

import { ApiClientFieldErrorCodes } from "./codes";
import { type ApiClientFieldErrors, type ApiClientFieldError } from "./types";

export type IssueLookup<L extends string> = { [key in L]?: (issue: z.ZodIssue) => boolean };

export const parseZodError = <O extends z.ZodObject<{ [key in string]: z.ZodTypeAny }>>(
  error: z.ZodError,
  schema: O,
  lookup?: IssueLookup<keyof O["shape"] & string>,
): ApiClientFieldErrors<keyof O["shape"] & string> => {
  const errs: ApiClientFieldErrors<keyof O["shape"] & string> = {};

  const keys = Object.values(schema.keyof().Values);
  if (keys.length === 0) {
    throw new Error("Cannot parse zod error for an empty schema!");
  }
  for (const field of keys) {
    const iss: ApiClientFieldError[] = uniqBy(
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
    if (iss.length !== 0) {
      errs[field as keyof O["shape"] & string] = iss as [
        ApiClientFieldError,
        ...ApiClientFieldError[],
      ];
    }
  }
  if (Object.keys(errs).length === 0) {
    throw new Error("The zod error does not contain any candidate error issues!");
  }
  return errs;
};
