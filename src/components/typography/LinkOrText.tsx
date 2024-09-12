"use client";

import { Link } from "~/components/buttons";
import { Tooltip, type TooltipProps } from "~/components/floating/Tooltip";
import {
  classNames,
  type FontSize,
  type ComponentProps,
  type FontWeight,
  type FontFamily,
} from "~/components/types";

import { Text } from "./Text";

export interface LinkOrTextProps extends ComponentProps {
  readonly url?: string | null;
  readonly children: string;
  readonly tooltip?: string;
  readonly tooltipPlacement?: TooltipProps["placement"];
  readonly fontSize?: FontSize;
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
              element="a"
              openInNewTab
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
        element="a"
        openInNewTab
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
