import React from "react";

import { Icon } from "~/components/icons/Icon";
import {
  type ComponentProps,
  classNames,
  type TypographyCharacteristics,
} from "~/components/types";
import { type Size, sizeToString } from "~/components/types/sizes";

import { Text } from "./Text";

export interface PipedTextProps extends TypographyCharacteristics, ComponentProps {
  readonly children: (string | JSX.Element | null | undefined)[];
  readonly gap?: Size;
  readonly textClassName?: ComponentProps["className"];
  readonly pipeClassName?: ComponentProps["className"];
  readonly pipeSize?: Size;
}

export const PipedText = ({
  children,
  pipeClassName,
  fontSize = "xs",
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
      className={classNames("flex flex-row items-center", className)}
      style={{ ...style, gap: sizeToString(gap, "px") }}
    >
      {filtered.map((child, index) => {
        if (index !== filtered.length - 1) {
          /* TODO: Make size of pipe icon dynamic based on size of text - we can either do this
             in SASS or we need a TS mapping of text size strings to font sizes... */
          return (
            <React.Fragment key={index}>
              <Text
                {...props}
                fontSize={fontSize}
                className={classNames("text-description", textClassName)}
              >
                {child}
              </Text>
              <Icon
                icon="pipe"
                size={pipeSize}
                className={classNames("text-gray-800", pipeClassName)}
              />
            </React.Fragment>
          );
        }
        return (
          <Text
            {...props}
            key={index}
            fontSize={fontSize}
            className={classNames("text-description", textClassName)}
          >
            {child}
          </Text>
        );
      })}
    </div>
  );
};
