import React from "react";

import { pick, omit } from "lodash-es";

import { UnreachableCaseError } from "~/application/errors";
import { logger } from "~/internal/logger";

import {
  classNames,
  type QuantitativeSize,
  type ComponentProps,
  sizeToString,
  parseDataAttributes,
} from "~/components/types";

export type ViewPosition = "relative" | "absolute" | "fixed";
export type ViewOverflow = "scroll" | "auto" | "hidden" | "visible";
export type ViewFill = "screen" | "parent";

export type ViewComponent = "tbody" | "div" | "tr";

const ViewSizePropNames = [
  "height",
  "width",
  "maxHeight",
  "maxWidth",
  "minHeight",
  "minWidth",
] as const;

export type ViewSizePropName = (typeof ViewSizePropNames)[number];

export type ViewSizeProps = { [key in ViewSizePropName]?: QuantitativeSize<"px"> | ViewFill };

export type ViewPositionProps = Partial<{
  readonly absolute: true;
  readonly relative: true;
  readonly fixed: true;
  readonly position: ViewPosition;
}>;

export type ViewOverflowProps = Partial<{
  readonly overflow: ViewOverflow;
  readonly overflowX: ViewOverflow;
  readonly overflowY: ViewOverflow;
}>;

export type ViewFillProps = Partial<{
  readonly fill: ViewFill | null;
  readonly fillParent: true;
  readonly fillScreen: true;
}>;

export type ViewFlexProps = Partial<{
  readonly flex: true;
  readonly orientation: "row" | "column";
  readonly row: true;
  readonly column: true;
  readonly centerChildren: true;
  readonly grow: true;
}>;

type ViewInternalProps = ComponentProps &
  ViewSizeProps &
  ViewPositionProps &
  ViewOverflowProps &
  ViewFillProps &
  ViewFlexProps & {
    readonly __default_position__?: ViewPosition;
    readonly children?: React.ReactNode;
    readonly dim?: true;
    readonly isDisabled?: true;
    readonly dimIfDisabled?: false;
  };

export const ViewInternalPropsMap = {
  __default_position__: true,
  className: true,
  style: true,
  children: true,
  dim: true,
  isDisabled: true,
  dimIfDisabled: true,
  height: true,
  width: true,
  maxHeight: true,
  maxWidth: true,
  minHeight: true,
  minWidth: true,
  fill: true,
  fillParent: true,
  fillScreen: true,
  flex: true,
  orientation: true,
  row: true,
  column: true,
  centerChildren: true,
  grow: true,
  position: true,
  absolute: true,
  fixed: true,
  relative: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
} as const satisfies {
  [key in keyof Required<ViewInternalProps>]: true;
};

export const omitViewInternalProps = <P extends Record<string, unknown>>(
  props: P,
): Omit<P, keyof typeof ViewInternalPropsMap & keyof P> =>
  omit(props, Object.keys(ViewInternalPropsMap) as (keyof Required<ViewInternalProps>)[]);

export const pickViewInternalProps = <P extends Record<string, unknown>>(
  props: P,
): Pick<P, keyof typeof ViewInternalPropsMap & keyof P> =>
  pick(props, Object.keys(ViewInternalPropsMap) as (keyof Required<ViewInternalProps>)[]);

export type ViewProps<C extends ViewComponent> = ViewInternalProps &
  Omit<React.ComponentProps<C>, keyof ViewInternalProps> & {
    readonly component?: C;
  };

const parseFlex = <C extends ViewComponent>({
  flex = true,
  orientation,
  row,
  column,
  centerChildren,
  grow,
}: Pick<
  ViewProps<C>,
  "flex" | "orientation" | "row" | "column" | "centerChildren" | "grow"
>): string => {
  if (centerChildren) {
    return classNames("flex", "flex-col", "items-center", "justify-center", { grow });
  } else if (flex) {
    if (orientation) {
      if (row || column) {
        logger.warn(
          "The props 'row' and/or 'column' should not be specified on a view when the " +
            "'orientation' prop is explicitly defined.",
          { orientation, row, column },
        );
      }
      return classNames("flex", {
        grow,
        "flex-col": orientation === "column",
        "flex-row": orientation === "row",
      });
    } else if (row && column) {
      logger.warn(
        "The props 'row' and 'column' should not both be specified on a view at the " +
          "same time.  The 'column' prop will take precedence.",
        { orientation, row, column },
      );
      return classNames("flex", "flex-col", { grow });
    }
    return classNames("flex", { grow, "flex-col": column || row === undefined, "flex-row": row });
  }
  return "";
};

const parsePosition = <C extends ViewComponent>({
  position,
  absolute,
  fixed,
  relative,
  __default_position__,
}: Pick<
  ViewProps<C>,
  "position" | "absolute" | "relative" | "__default_position__" | "fixed"
>): ViewPosition => {
  if (position !== undefined) {
    if (absolute !== undefined || relative !== undefined || fixed !== undefined) {
      logger.warn(
        "The props 'absolute', 'relative' and/or 'fixed' should not be specified on a view when " +
          "the 'position' prop is explicitly defined.",
        { absolute, relative, position, fixed },
      );
    }
    return position;
  } else if (absolute !== undefined) {
    if (relative || fixed) {
      logger.warn(
        "The prop 'absolute' should not be specified at the same time as the props " +
          "'relative' or 'fixed'. The 'absolute' prop will take precedence.",
        { absolute, relative, position },
      );
    }
    return "absolute";
  } else if (relative !== undefined) {
    if (fixed) {
      logger.warn(
        "The prop 'relative' should not be specified at the same time as the prop " +
          "'fixed'. The 'relative' prop will take precedence.",
        { absolute, relative, position, fixed },
      );
    }
    return "relative";
  } else if (fixed !== undefined) {
    return "fixed";
  }
  return __default_position__ ?? "relative";
};

const parseFill = <C extends ViewComponent>({
  fill,
  fillParent,
  fillScreen,
}: Pick<ViewProps<C>, "fill" | "fillParent" | "fillScreen">): ViewFill | null => {
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

const OverflowClassName = (overflow: ViewOverflow) =>
  classNames({
    "overflow-hidden": overflow === "hidden",
    "overflow-visible": overflow === "visible",
    "overflow-scroll": overflow === "scroll",
    "overflow-auto": overflow === "auto",
  });

const OverflowXClassName = (overflow: ViewOverflow) =>
  classNames({
    "overflow-x-hidden": overflow === "hidden",
    "overflow-x-visible": overflow === "visible",
    "overflow-x-scroll": overflow === "scroll",
    "overflow-x-auto": overflow === "auto",
  });

const OverflowYClassName = (overflow: ViewOverflow) =>
  classNames({
    "overflow-y-hidden": overflow === "hidden",
    "overflow-y-visible": overflow === "visible",
    "overflow-y-scroll": overflow === "scroll",
    "overflow-y-auto": overflow === "auto",
  });

const parseOverflow = <C extends ViewComponent>({
  overflow,
  overflowX,
  overflowY,
}: Pick<ViewProps<C>, "overflow" | "overflowX" | "overflowY">): string => {
  if (overflow !== undefined) {
    if (overflowX !== undefined || overflowY !== undefined) {
      logger.warn(
        "The props 'overflowX' and 'overflowY' should not be specified on a view when the " +
          "'overflow' prop is explicitly defined.",
        { overflow, overflowX, overflowY },
      );
    }
    return classNames(OverflowClassName(overflow));
  } else if (overflowX && overflowY) {
    return classNames(OverflowXClassName(overflowX), OverflowYClassName(overflowY));
  } else if (overflowX) {
    return OverflowXClassName(overflowX);
  } else if (overflowY) {
    return OverflowYClassName(overflowY);
  }
  return OverflowClassName("hidden");
};

/* eslint-disable-next-line no-console */
const consoleError = console.error;

/* Note:
   -----
   When using the <Loading /> component, as a <tr> element, the loading indicator (an <i> element)
   will be placed inside of the <tr /> element.  This causes React to issue a warning similar to
   the following:

   Warning: validateDOMNesting(...): <i> cannot appear as a child of <tr>.

   However, there does not seem to e anything crtitically (or even mildly) problematic with the
   inclusion of an <i> element inside of the <tr> element - everything seems to be working as
   expected.

   For now, we will assume this is just React being over-sensitive about the structure of the
   DOM, and will ignore this console warning manually.  If we notice issues with it down the line,
   we should remove this suppression and investigate further. */
/* eslint-disable-next-line no-console */
console.error = (msg, ...args) => {
  if (
    typeof msg === "string" &&
    (msg.includes("validateDOMNesting(...)") || msg.includes("In HTML")) &&
    args.length >= 2 &&
    args[0] === "<i>" &&
    ["tr", "tbody"].includes(args[1])
  ) {
    return;
  } else if (
    typeof msg === "string" &&
    msg.includes("Warning: In HTML, <i> cannot be a child of <tbody>.")
  ) {
    return;
  }
  consoleError(msg, ...args);
};

const getViewStyle = <C extends ViewComponent>(
  props: Pick<ViewProps<C>, ViewSizePropName | "style">,
) =>
  ViewSizePropNames.reduce((prev: React.CSSProperties, key: ViewSizePropName) => {
    const size = props[key];
    if (size !== "parent" && size !== "screen" && size !== undefined) {
      return { ...prev, [key]: sizeToString(size, "px") };
    }
    return prev;
  }, props.style ?? {});

export const View = <C extends ViewComponent>({
  children,
  component = "div" as C,
  ...props
}: ViewProps<C>) => {
  const _fill = parseFill(props);
  const _position = parsePosition(props);

  const ps = {
    ...omitViewInternalProps(props),
    style: getViewStyle(props),
    className: classNames(
      "view",
      _position,
      parseOverflow(props),
      parseFlex(props),
      {
        "h-full": _fill === "parent" || props.height === "parent",
        "w-full": _fill === "parent" || props.width === "parent",
        "max-w-full": props.maxWidth === "parent",
        "max-h-full": props.maxHeight === "parent",
        "min-w-full": props.minWidth === "parent",
        "min-h-full": props.minHeight === "parent",
        "left-0 top-0": _fill !== null && _position === "absolute",
        "opacity-30": props.dim || (props.dimIfDisabled !== false && props.isDisabled),
        "pointer-events-none": props.isDisabled,
      },
      props.className,
    ),
  } as Omit<React.ComponentProps<C>, "ref">;

  const p = {
    ...ps,
    ...parseDataAttributes({
      screenW: _fill === "screen" || props.width === "screen",
      screenH: _fill === "screen" || props.height === "screen",
    }),
  };

  switch (component) {
    case "div":
      return <div {...(p as React.ComponentProps<"div">)}>{children}</div>;
    case "tbody":
      return <tbody {...(p as React.ComponentProps<"tbody">)}>{children}</tbody>;
    case "tr":
      return <tr {...(p as React.ComponentProps<"tr">)}>{children}</tr>;
    default:
      throw new UnreachableCaseError(`Invalid component: ${component}!`);
  }
};
