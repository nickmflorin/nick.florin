import React from "react";

import clsx from "clsx";

import { Icon } from "~/components/icons/Icon";
import {
  sizeToString,
  type Size,
  type ComponentProps,
  withoutOverridingClassName,
} from "~/components/types";
import { Text } from "~/components/typography/Text";

import { type BaseTypographyProps } from "./types";

export interface PipedTextProps extends BaseTypographyProps {
  readonly children: (string | JSX.Element | null | undefined)[];
  readonly gap?: Size;
  readonly textClassName?: ComponentProps["className"];
  readonly pipeClassName?: ComponentProps["className"];
  readonly pipeSize?: Size;
}

export const PipedText = ({
  children,
  pipeClassName,
  size = "xs",
  pipeSize = "14px",
  gap = "4px",
  textClassName,
  style,
  className,
  ...props
}: PipedTextProps): JSX.Element => {
  const filtered = children.filter(
    (child): child is JSX.Element | string => child !== null && child !== undefined,
  );
  if (filtered.length === 0) {
    return <></>;
  }
  return (
    <div
      className={clsx("flex flex-row items-center", className)}
      style={{ ...style, gap: sizeToString(gap) }}
    >
      {filtered.map((child, index) => {
        if (index !== filtered.length - 1) {
          /* TODO: Make size of pipe icon dynamic based on size of text - we can either do this
             in SASS or we need a TS mapping of text size strings to font sizes... */
          return (
            <React.Fragment key={index}>
              <Text
                {...props}
                size={size}
                className={clsx(withoutOverridingClassName("text-body-light", textClassName))}
              >
                {child}
              </Text>
              <Icon
                name="pipe"
                size={pipeSize}
                className={clsx(withoutOverridingClassName("text-gray-800", pipeClassName))}
              />
            </React.Fragment>
          );
        }
        return (
          <Text
            {...props}
            key={index}
            size={size}
            className={clsx(withoutOverridingClassName("text-body-light", textClassName))}
          >
            {child}
          </Text>
        );
      })}
    </div>
  );
};
