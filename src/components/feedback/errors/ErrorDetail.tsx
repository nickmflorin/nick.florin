import React from "react";

import clsx from "clsx";

import type * as types from "../types";

import { type ComponentProps } from "~/components/types";
import { type Size, sizeToString } from "~/components/types/sizes";
import { type BaseTypographyProps } from "~/components/types/typography";

import { ErrorContent } from "./ErrorContent";
import { ErrorTitle } from "./ErrorTitle";

export interface ErrorDetailProps extends ComponentProps {
  readonly gap?: Size;
  readonly title?: string;
  readonly children?: types.ErrorContentType;
  readonly error?: types.ErrorType;
  readonly titleClassName?: ComponentProps["className"];
  readonly titleFontSize?: BaseTypographyProps["fontSize"];
  readonly titleFontWeight?: BaseTypographyProps["fontWeight"];
  readonly titleFontFamily?: BaseTypographyProps["fontFamily"];
}

export const ErrorDetail = ({
  style,
  className,
  gap = 12,
  title = "Error",
  titleClassName = "text-text",
  titleFontFamily,
  titleFontWeight = "medium",
  titleFontSize = "lg",
  children,
  error,
}: ErrorDetailProps): JSX.Element => (
  <div
    style={{ ...style, gap: sizeToString(gap, "px") }}
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
