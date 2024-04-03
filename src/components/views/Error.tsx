import React, { useMemo } from "react";

import clsx from "clsx";

import { isHttpError, type HttpError, ApiClientError } from "~/api";
import { type Size, type ComponentProps, sizeToString } from "~/components/types";
import { type ExtendingTypographyProps } from "~/components/typography";
import { Text } from "~/components/typography/Text";

import * as types from "./types";

export interface ErrorContentBaseProps extends Omit<ExtendingTypographyProps, "transform"> {
  readonly textClassName?: ComponentProps["className"];
}

interface ErrorContentProps extends ErrorContentBaseProps {
  readonly children: types.ErrorContentType;
}

const ErrorContent = ({
  textClassName = "text-gray-500",
  fontSize = "sm",
  fontFamily,
  fontWeight = "regular",
  children,
}: ErrorContentProps) => {
  if (Array.isArray(children)) {
    return (
      <div className="flex flex-col gap-[10px]">
        {children.map((child, index) => (
          <ErrorContent
            key={index}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            textClassName={textClassName}
          >
            {child}
          </ErrorContent>
        ))}
      </div>
    );
  } else if (typeof children === "string") {
    return (
      <Text
        size={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        className={clsx("text-center", textClassName)}
      >
        {children}
      </Text>
    );
  }
  return children;
};

interface ErrorTitleProps extends ExtendingTypographyProps, ComponentProps {
  readonly children?: string;
  readonly error?: string | boolean | HttpError | string[] | null;
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

export type ErrorProps = types.ErrorContentUnionProps &
  ComponentProps & {
    readonly gap?: Size;
    readonly title?: string;
    readonly titleClassName?: ComponentProps["className"];
    readonly titleFontSize?: ExtendingTypographyProps["fontSize"];
    readonly titleFontWeight?: ExtendingTypographyProps["fontWeight"];
    readonly titleFontFamily?: ExtendingTypographyProps["fontFamily"];
  };

export const Error = ({
  style,
  className,
  gap = 12,
  title = "Error",
  titleClassName = "text-body",
  titleFontFamily,
  titleFontWeight = "medium",
  titleFontSize = "lg",
  ...props
}: ErrorProps): JSX.Element => {
  const content = types.parseErrorContent(props);

  if (!content) {
    return <></>;
  }
  return (
    <div
      style={{ ...style, gap: sizeToString(gap) }}
      className={clsx("flex flex-col justify-center", className)}
    >
      <ErrorTitle
        error={props.error}
        fontSize={titleFontSize}
        fontWeight={titleFontWeight}
        fontFamily={titleFontFamily}
        className={titleClassName}
      >
        {title}
      </ErrorTitle>
      <ErrorContent {...props}>{content}</ErrorContent>
    </div>
  );
};
