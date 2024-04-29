"use client";
import clsx from "clsx";

import { Link } from "~/components/buttons";
import { Tooltip, type TooltipProps } from "~/components/floating/Tooltip";
import {
  type ComponentProps,
  type BodyFontSize,
  type FontWeight,
  type FontFamily,
} from "~/components/types";
import { Text } from "~/components/typography/Text";

export interface LinkOrTextProps extends ComponentProps {
  readonly url?: string | null;
  readonly children: string;
  readonly tooltip?: string;
  readonly tooltipPlacement?: TooltipProps["placement"];
  readonly fontSize?: BodyFontSize;
  readonly fontWeight?: FontWeight;
  readonly textClassName?: ComponentProps["className"];
  readonly linkClassName?: ComponentProps["className"];
  readonly fontFamily?: FontFamily;
}

export const LinkOrText = ({
  children,
  url,
  tooltip,
  tooltipPlacement = "bottom-end",
  fontSize = "md",
  textClassName,
  linkClassName,
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
              className={clsx(props.className, linkClassName)}
              href={url}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              options={{ as: "a" }}
              target="_blank"
              rel="noopener noreferrer"
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
        className={clsx(props.className, linkClassName)}
        href={url}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        options={{ as: "a" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </Link>
    );
  }
  return (
    <Text
      {...props}
      className={clsx(props.className, textClassName)}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
    >
      {children}
    </Text>
  );
};
