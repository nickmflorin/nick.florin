import React, { useMemo } from "react";

import { isHttpError, ApiClientError } from "~/api";

import { classNames } from "~/components/types";
import { type ComponentProps, type TypographyCharacteristics } from "~/components/types";
import { Text } from "~/components/typography";

import { type ErrorType } from "../types";

export interface ErrorTitleProps extends TypographyCharacteristics, ComponentProps {
  readonly children?: string;
  readonly error?: ErrorType;
}

export const ErrorTitle = ({
  children,
  error,
  className = "text-body",
  fontWeight = "medium",
  fontSize = "lg",
  ...props
}: ErrorTitleProps): JSX.Element => {
  const title = useMemo(() => {
    if (children) {
      return children;
    } else if (isHttpError(error) && error instanceof ApiClientError) {
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
