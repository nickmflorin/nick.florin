import React, { useMemo } from "react";

import clsx from "clsx";

import { isHttpError, ApiClientError } from "~/api";
import { type ComponentProps } from "~/components/types";
import { type ExtendingTypographyProps } from "~/components/typography";
import { Text } from "~/components/typography/Text";

import { type ErrorType } from "../types";

export interface ErrorTitleProps extends ExtendingTypographyProps, ComponentProps {
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
      size={fontSize}
      fontWeight={fontWeight}
      className={clsx("text-center", className)}
    >
      {title}
    </Text>
  );
};
