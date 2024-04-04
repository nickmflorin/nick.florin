import React from "react";

import clsx from "clsx";

import { isHttpError } from "~/api";
import { type ComponentProps } from "~/components/types";
import { type ExtendingTypographyProps } from "~/components/typography";
import { Text } from "~/components/typography/Text";

import * as types from "./types";

export interface ErrorContentProps extends Omit<ExtendingTypographyProps, "transform"> {
  readonly textClassName?: ComponentProps["className"];
  readonly children?: types.ErrorContentType;
  readonly error?: types.ErrorType;
}

export const ErrorContent = ({
  textClassName = "text-gray-500",
  fontSize = "sm",
  fontFamily,
  fontWeight = "regular",
  children,
  error,
}: ErrorContentProps): JSX.Element => {
  const message = children ?? isHttpError(error) ? error : error ?? types.DEFAULT_ERROR_MESSAGE;
  if (Array.isArray(message)) {
    return (
      <div className="flex flex-col gap-[10px]">
        {message.map((child, index) => (
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
  } else if (typeof message === "string") {
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
  }
  return <>{message}</>;
};
