import React, { useMemo } from "react";

import clsx from "clsx";

import { isHttpError, type HttpError, ApiClientError } from "~/api";
import { type Size, type ComponentProps, sizeToString } from "~/components/types";
import { type ExtendingTypographyProps } from "~/components/typography";
import { Text } from "~/components/typography/Text";

type ErrorType = string | JSX.Element | HttpError | (string | JSX.Element)[];

interface ErrorContentProps extends Omit<ExtendingTypographyProps, "transform"> {
  readonly textClassName?: ComponentProps["className"];
  readonly children?: string | JSX.Element | (string | JSX.Element)[];
  readonly error?: ErrorType | null;
}

const ErrorContent = ({
  children,
  error,
  textClassName = "text-gray-500",
  fontSize = "sm",
  fontFamily,
  fontWeight = "regular",
}: ErrorContentProps) => {
  const message = useMemo(() => {
    if (children) {
      return children;
    } else if (isHttpError(error) && error instanceof ApiClientError) {
      return error.message;
    }
    return null;
  }, [children, error]);

  if (typeof message === "string") {
    return (
      <Text
        size={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        className={clsx("text-center", textClassName)}
      >
        {message}
      </Text>
    );
  } else if (Array.isArray(message)) {
    return (
      <div className="flex flex-col gap-[10px]">
        {message.map((child, index) =>
          typeof child === "string" ? (
            <Text
              key={index}
              size={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              className={clsx("text-center", textClassName)}
            >
              {child}
            </Text>
          ) : (
            <React.Fragment key={index}>{child}</React.Fragment>
          ),
        )}
      </div>
    );
  } else if (message) {
    return <>{message}</>;
  }
  return null;
};

interface ErrorTitleProps extends ExtendingTypographyProps, ComponentProps {
  readonly children?: string;
  readonly error?: ErrorType | null;
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

export interface ErrorProps extends ComponentProps, ErrorContentProps {
  readonly children?: string | JSX.Element | (string | JSX.Element)[];
  readonly gap?: Size;
  readonly title?: string;
  readonly titleClassName?: ComponentProps["className"];
  readonly titleFontSize?: ExtendingTypographyProps["fontSize"];
  readonly titleFontWeight?: ExtendingTypographyProps["fontWeight"];
  readonly titleFontFamily?: ExtendingTypographyProps["fontFamily"];
}

export const Error = ({
  children,
  style,
  className,
  gap = 12,
  error,
  title = "Error",
  titleClassName = "text-body",
  titleFontFamily,
  titleFontWeight = "medium",
  titleFontSize = "lg",
  ...props
}: ErrorProps): JSX.Element => {
  const content = (
    <ErrorContent {...props} error={error}>
      {children}
    </ErrorContent>
  );
  if (!content) {
    return <></>;
  }
  return (
    <div
      style={{ ...style, gap: sizeToString(gap) }}
      className={clsx("flex flex-col justify-center", className)}
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
      {content}
    </div>
  );
};
