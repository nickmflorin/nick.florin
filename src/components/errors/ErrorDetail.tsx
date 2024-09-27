import React from "react";

import type * as types from "./types";

import {
  type ComponentProps,
  classNames,
  sizeToString,
  type TypographyCharacteristics,
  type QuantitativeSize,
} from "~/components/types";

import { ErrorContent } from "./ErrorContent";
import { ErrorTitle } from "./ErrorTitle";

export interface ErrorDetailProps extends ComponentProps {
  readonly gap?: QuantitativeSize<"px">;
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
  titleClassName = "text-text",
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
