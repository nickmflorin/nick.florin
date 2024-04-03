import { isHttpError, type HttpError } from "~/api";

export type ErrorContentType = string | JSX.Element | (string | JSX.Element)[];

export const DEFAULT_ERROR_MESSAGE =
  "An unknown error occurred. We will get to the bottom of it, your patience is appreciated!";

type ErrorContentConditionalProps = {
  readonly children?: string | JSX.Element | JSX.Element[];
  readonly error: boolean | null;
};

type ErrorContentErrorProps = {
  readonly children?: never;
  readonly error: HttpError | null | string | string[];
};

type ErrorContentChildrenProps = {
  readonly children: string | JSX.Element | JSX.Element[];
  readonly error?: never;
};

export type ErrorContentUnionProps =
  | ErrorContentConditionalProps
  | ErrorContentChildrenProps
  | ErrorContentErrorProps;

export const parseErrorContent = <P extends ErrorContentUnionProps>({
  error,
  children,
}: P): ErrorContentType | null => {
  if (error !== undefined) {
    if (error === null || error === false) {
      return null;
    } else if (error === true) {
      return children ?? DEFAULT_ERROR_MESSAGE;
    } else if (isHttpError(error)) {
      return error.message;
    }
    return error;
  } else if (children === undefined) {
    throw new TypeError(
      "Invalid Component Usage: The 'children' prop must be defined when the 'error' prop " +
        "is not explicitly provided.",
    );
  }
  return children;
};
