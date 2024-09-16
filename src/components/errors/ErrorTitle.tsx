import React, { useMemo } from "react";

import type * as types from "./types";

import { isHttpError, NetworkError } from "~/api";

import { type ComponentProps, classNames } from "~/components/types";
import { type TypographyCharacteristics } from "~/components/types/typography";
import { Text } from "~/components/typography/Text";

export interface ErrorTitleProps
  extends Omit<TypographyCharacteristics, "lineClamp" | "truncate">,
    ComponentProps {
  readonly children?: string;
  readonly error?: types.ErrorType;
}

export const ErrorTitle = ({
  children,
  error,
  className = "text-text",
  fontWeight = "medium",
  fontSize = "lg",
  ...props
}: ErrorTitleProps): JSX.Element => {
  const title = useMemo(() => {
    if (children) {
      return children;
    } else if (isHttpError(error) && !(error instanceof NetworkError)) {
      return `${error.statusCode}`;
    }
    return "Error";
  }, [children, error]);

  return (
    <Text
      {...props}
      fontSize={fontSize}
      fontWeight={fontWeight}
      className={classNames("text-center", className)}
    >
      {title}
    </Text>
  );
};
