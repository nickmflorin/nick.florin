import React from "react";

import type * as types from "../types";

import { classNames } from "~/components/types";
import {
  type ComponentProps,
  type Size,
  sizeToString,
  type TypographyCharacteristics,
} from "~/components/types";

import { ErrorContent } from "./ErrorContent";
import { ErrorTitle } from "./ErrorTitle";

export interface ErrorDetailProps extends ComponentProps {
  readonly gap?: Size;
  readonly title?: string;
  readonly children?: types.ErrorContentType;
  readonly error?: types.ErrorType;
  readonly titleClassName?: ComponentProps["className"];
  readonly titleFontSize?: TypographyCharacteristics["fontSize"];
  readonly titleFontWeight?: TypographyCharacteristics["fontWeight"];
  readonly titleFontFamily?: TypographyCharacteristics["fontFamily"];
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
    style={{ ...style, gap: sizeToString(gap, "px") }}
    className={classNames("flex flex-col justify-center max-w-[90%]", className)}
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
