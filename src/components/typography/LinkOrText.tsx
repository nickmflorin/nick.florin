"use client";

import { Link } from "~/components/buttons";
import { Tooltip, type TooltipProps } from "~/components/floating/Tooltip";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { type TextFontSize, type FontWeight, type FontFamily } from "~/components/types/typography";

import { Text } from "./Text";

export interface LinkOrTextProps extends ComponentProps {
  readonly url?: string | null;
  readonly children: string;
  readonly tooltip?: string;
  readonly tooltipPlacement?: TooltipProps["placement"];
  readonly fontSize?: TextFontSize;
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
              className={classNames(props.className, linkClassName)}
              href={url}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              as="a"
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
        className={classNames(props.className, linkClassName)}
        href={url}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        as="a"
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
      className={classNames(props.className, textClassName)}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
    >
      {children}
    </Text>
  );
};
