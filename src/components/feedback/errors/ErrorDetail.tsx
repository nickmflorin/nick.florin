import React from "react";

import clsx from "clsx";

import type * as types from "../types";

import { type Size, type ComponentProps, sizeToString } from "~/components/types";
import { type ExtendingTypographyProps } from "~/components/typography";

import { ErrorContent } from "./ErrorContent";
import { ErrorTitle } from "./ErrorTitle";

export interface ErrorDetailProps extends ComponentProps {
  readonly gap?: Size;
  readonly title?: string;
  readonly children?: types.ErrorContentType;
  readonly error?: types.ErrorType;
  readonly titleClassName?: ComponentProps["className"];
  readonly titleFontSize?: ExtendingTypographyProps["fontSize"];
  readonly titleFontWeight?: ExtendingTypographyProps["fontWeight"];
  readonly titleFontFamily?: ExtendingTypographyProps["fontFamily"];
}

export const ErrorDetail = ({
  style,
  className,
  gap = 12,
  title = "Error",
  titleClassName = "text-body",
  titleFontFamily,
  titleFontWeight = "medium",
  titleFontSize = "lg",
  children,
  error,
}: ErrorDetailProps): JSX.Element => (
  <div
    style={{ ...style, gap: sizeToString(gap) }}
    className={clsx("flex flex-col justify-center max-w-[90%]", className)}
  >
    <ErrorTitle
      error={error}
      fontSize={titleFontSize}
      fontWeight={titleFontWeight}
      fontFamily={titleFontFamily}
      className={titleClassName}
    >
      {title}
    </ErrorTitle>
    <ErrorContent error={error}>{children}</ErrorContent>
  </div>
);
