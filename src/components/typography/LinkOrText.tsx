"use client";
import { Link } from "~/components/buttons";
import { Tooltip, type TooltipProps } from "~/components/floating/Tooltip";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

import { type TypographySize, type FontWeight, type FontFamily } from "./types";

export interface LinkOrTextProps extends ComponentProps {
  readonly url?: string | null;
  readonly children: string;
  readonly tooltip?: string;
  readonly tooltipPlacement?: TooltipProps["placement"];
  readonly fontSize?: TypographySize;
  readonly fontWeight?: FontWeight;
  readonly textClassName?: ComponentProps["className"];
  readonly fontFamily?: FontFamily;
}

export const LinkOrText = ({
  children,
  url,
  tooltip,
  tooltipPlacement = "bottom-end",
  fontSize = "md",
  textClassName,
  fontFamily = "inter",
  fontWeight = "medium",
  ...props
}: LinkOrTextProps): JSX.Element => {
  if (url) {
    if (tooltip) {
      return (
        <Tooltip content={tooltip} placement={tooltipPlacement}>
          {({ ref, params }) => (
            <Link
              {...params}
              {...props}
              ref={ref}
              className={textClassName}
              href={url}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              options={{ as: "a" }}
            >
              {children}
            </Link>
          )}
        </Tooltip>
      );
    }
    return (
      <Link
        {...props}
        className={textClassName}
        href={url}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        options={{ as: "a" }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Text
      {...props}
      className={textClassName}
      size={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
    >
      {children}
    </Text>
  );
};
