import React, { type ReactNode } from "react";

import clsx from "clsx";

import { isHttpError, type HttpError } from "~/application/errors";
import { type Size, type ComponentProps, sizeToString } from "~/components/types";
import { type BaseTypographyProps } from "~/components/typography";
import { Text } from "~/components/typography/Text";
import { View, type ViewProps } from "~/components/views/View";

type ErrorType = string | JSX.Element | HttpError | (string | JSX.Element)[];

interface ErrorContentProps extends Omit<BaseTypographyProps, "size" | "transform"> {
  readonly fontSize?: BaseTypographyProps["size"];
  readonly textClassName?: ComponentProps["className"];
  readonly children: string | JSX.Element | (string | JSX.Element)[];
}

export const ErrorContent = ({
  children,
  textClassName = "text-gray-500",
  fontSize = "sm",
  fontFamily,
  fontWeight = "regular",
  ...props
}: ErrorContentProps): JSX.Element => {
  if (typeof children === "string") {
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
  } else if (Array.isArray(children)) {
    return (
      <div className="flex flex-col gap-[10px]">
        {children.map((child, index) =>
          typeof child === "string" ? (
            <Text {...props} key={index} className={clsx("text-center", textClassName)}>
              {children}
            </Text>
          ) : (
            <React.Fragment key={index}>{child}</React.Fragment>
          ),
        )}
      </div>
    );
  } else {
    return <>{children}</>;
  }
};

interface ErrorProps extends ComponentProps, Omit<ErrorContentProps, "children"> {
  readonly children?: string | JSX.Element | (string | JSX.Element)[];
  readonly error?: ErrorType;
  readonly gap?: Size;
  readonly title?: string;
  readonly titleClassName?: ComponentProps["className"];
  readonly titleFontSize?: BaseTypographyProps["size"];
  readonly titleFontWeight?: BaseTypographyProps["fontWeight"];
  readonly titleFontFamily?: BaseTypographyProps["fontFamily"];
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
  const content =
    typeof children !== "undefined" ? children : isHttpError(error) ? error.message : error;
  if (!content) {
    return <></>;
  }
  return (
    <div
      style={{ ...style, gap: sizeToString(gap) }}
      className={clsx("flex flex-col justify-center", className)}
    >
      <Text
        size={titleFontSize}
        fontWeight={titleFontWeight}
        fontFamily={titleFontFamily}
        className={clsx("text-center", titleClassName)}
      >
        {title}
      </Text>
      <ErrorContent {...props}>{content}</ErrorContent>
    </div>
  );
};

export interface ErrorViewProps extends ErrorProps, Omit<ViewProps, "children"> {}

export const ErrorView = ({ children, ...props }: ErrorViewProps) => (
  <View {...props}>
    <Error {...props}>{children}</Error>
  </View>
);

export interface ErrorOrRenderProps extends Omit<ErrorViewProps, "children" | "error"> {
  readonly error: JSX.Element | string | null | HttpError | undefined;
  readonly children: ReactNode;
}

export const ErrorOrRender = ({
  error,
  overlay = true,
  children,
  ...props
}: ErrorOrRenderProps): JSX.Element => {
  if (children) {
    return error ? <ErrorView {...props} error={error} /> : <>{children}</>;
  } else if (error !== undefined && error !== null) {
    return <ErrorView {...props} error={error} overlay={overlay} />;
  }
  return <></>;
};
