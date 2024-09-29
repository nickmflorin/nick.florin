import { type ReactNode } from "react";

import { type ApiError } from "~/api";

export type ErrorContentType = ReactNode | ReactNode[];
export type ErrorType = string | string[] | null | Error | ApiError;

export const DEFAULT_ERROR_MESSAGE =
  "An unknown error occurred. We will get to the bottom of it, your patience is appreciated!";
