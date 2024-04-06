import clsx from "clsx";

import { logger } from "~/application/logger";
import { type ComponentProps } from "~/components/types";

type Position = "relative" | "absolute";
type Overflow = "scroll" | "auto" | "hidden" | "visible";
type Fill = "screen" | "parent";

export type AbstractViewProps = ComponentProps & {
  readonly children?: React.ReactNode;
  readonly overlay?: boolean;
  readonly dimmed?: boolean;
  readonly blurred?: boolean;
  readonly absolute?: boolean;
  readonly relative?: boolean;
  readonly position?: "relative" | "absolute";
  readonly overflow?: Overflow;
  readonly overflowX?: Overflow;
  readonly overflowY?: Overflow;
  readonly fill?: Fill | null;
  readonly fillParent?: boolean;
  readonly fillScreen?: boolean;
  readonly centerChildren?: boolean;
};

const parsePosition = ({
  position,
  absolute,
  relative,
}: Pick<AbstractViewProps, "position" | "absolute" | "relative">): Position => {
  if (position !== undefined) {
    if (absolute !== undefined || relative !== undefined) {
      logger.warn(
        "The props 'absolute' and 'relative' should not be specified on a view when the " +
          "'position' prop is explicitly defined.",
        { absolute, relative, position },
      );
    }
    return position;
  } else if (absolute) {
    if (relative) {
      logger.warn(
        "The props 'absolute' and 'relative' should not both be specified on a view at the " +
          "same time.  The 'absolute' prop will take precedence.",
        { absolute, relative, position },
      );
    }
    return "absolute";
  }
  return "relative";
};

const parseFill = ({
  fill,
  fillParent,
  fillScreen,
}: Pick<AbstractViewProps, "fill" | "fillParent" | "fillScreen">): Fill | null => {
  if (fill !== undefined) {
    if (fillParent !== undefined || fillScreen !== undefined) {
      logger.warn(
        "The props 'fillParent' and 'fillScreen' should not be specified on a view when the " +
          "'fill' prop is explicitly defined.",
        { fill, fillParent, fillScreen },
      );
    }
    return fill;
  } else if (fillScreen) {
    if (fillParent) {
      logger.warn(
        "The props 'fillScreen' and 'fillParent' should not both be specified on a view at the " +
          "same time.  The 'fillParent' prop will take precedence.",
        { fill, fillParent, fillScreen },
      );
      return "parent";
    }
    return "screen";
  } else if (fillParent) {
    return "parent";
  }
  return null;
};

const OverflowClassName = (overflow: Overflow) =>
  clsx({
    "overflow-hidden": overflow === "hidden",
    "overflow-visible": overflow === "visible",
    "overflow-scroll": overflow === "scroll",
    "overflow-auto": overflow === "auto",
  });

const OverflowXClassName = (overflow: Overflow) =>
  clsx({
    "overflow-x-hidden": overflow === "hidden",
    "overflow-x-visible": overflow === "visible",
    "overflow-x-scroll": overflow === "scroll",
    "overflow-x-auto": overflow === "auto",
  });

const OverflowYClassName = (overflow: Overflow) =>
  clsx({
    "overflow-y-hidden": overflow === "hidden",
    "overflow-y-visible": overflow === "visible",
    "overflow-y-scroll": overflow === "scroll",
    "overflow-y-auto": overflow === "auto",
  });

const parseOverflow = ({
  overflow,
  overflowX,
  overflowY,
}: Pick<AbstractViewProps, "overflow" | "overflowX" | "overflowY">): string => {
  if (overflow !== undefined) {
    if (overflowX !== undefined || overflowY !== undefined) {
      logger.warn(
        "The props 'overflowX' and 'overflowY' should not be specified on a view when the " +
          "'overflow' prop is explicitly defined.",
        { overflow, overflowX, overflowY },
      );
    }
    return clsx(OverflowClassName(overflow));
  } else if (overflowX && overflowY) {
    return clsx(OverflowXClassName(overflowX), OverflowYClassName(overflowY));
  } else if (overflowX) {
    return OverflowXClassName(overflowX);
  } else if (overflowY) {
    return OverflowYClassName(overflowY);
  }
  return OverflowClassName("hidden");
};

export const AbstractView = ({
  children,
  dimmed = false,
  blurred = false,
  overlay = false,
  absolute,
  position,
  relative,
  overflow,
  overflowX,
  overflowY,
  centerChildren,
  fill,
  fillParent,
  fillScreen,
  style,
  className,
}: AbstractViewProps) => {
  const _fill = parseFill({ fill, fillParent, fillScreen });
  const _position = parsePosition({ position, absolute, relative });
  return (
    <div
      style={style}
      className={clsx(
        _position,
        parseOverflow({ overflow, overflowX, overflowY }),
        {
          "h-[100vh] w-[100vw]": _fill === "screen",
          "h-full w-full": _fill === "parent",
          "flex flex-col items-center justify-center": centerChildren,
          "left-0 top-0": _fill !== null && _position === "absolute",
          "view--overlay": overlay,
          "view--blurred": blurred,
          "view--dimmed": dimmed,
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
