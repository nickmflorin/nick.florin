import { type ReactNode } from "react";

import { type HttpError } from "~/api";

export type ErrorContentType = ReactNode | ReactNode[];
export type ErrorType = HttpError | string | string[] | null | Error;

export const DEFAULT_ERROR_MESSAGE =
  "An unknown error occurred. We will get to the bottom of it, your patience is appreciated!";
