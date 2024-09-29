import React from "react";

import { isApiError } from "~/api";

import {
  type ComponentProps,
  type TypographyCharacteristics,
  classNames,
} from "~/components/types";
import { Text } from "~/components/typography/Text";

import * as types from "./types";

export interface ErrorContentProps
  extends Omit<TypographyCharacteristics, "transform" | "lineClamp" | "truncate"> {
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
  const message =
    children !== undefined
      ? children
      : error && isApiError(error)
        ? error.message
        : (error ?? types.DEFAULT_ERROR_MESSAGE);

  if (Array.isArray(message)) {
    for (const m of message) {
      if (m instanceof Error) {
        throw new Error(JSON.stringify(message));
      }
    }
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
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        className={classNames("text-center", textClassName)}
      >
        {message}
      </Text>
    );
  }
  return <>{message}</>;
};
