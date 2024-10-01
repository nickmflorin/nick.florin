"use client";
import React, { useState } from "react";

import type { BadgeSize } from "./types";

import { ShowMoreLink } from "~/components/buttons/ShowMoreLink";
import {
  type TypographyVisibilityState,
  classNames,
  type ScreenSizeRangeMap,
  type ComponentProps,
  type ContainerSizeRangeMap,
  getFromContainerSizeRangeMap,
} from "~/components/types";
import { BaseTypography, type BaseTypographyProps } from "~/components/typography/BaseTypography";
import { useContainerSizes } from "~/hooks/use-screen-sizes";

export interface BadgeCollectionChildrenProps
  extends ComponentProps,
    Omit<
      BaseTypographyProps<"div">,
      "lineClamp" | "align" | "truncate" | "component" | "children"
    > {
  readonly children: JSX.Element[];
  readonly size?: BadgeSize;
  readonly data?: never;
  readonly maximumBadges?: number | ContainerSizeRangeMap<number>;
}

export interface BadgeCollectionCallbackProps<M>
  extends ComponentProps,
    Omit<
      BaseTypographyProps<"div">,
      "lineClamp" | "align" | "truncate" | "children" | "component"
    > {
  readonly data: M[];
  readonly size?: BadgeSize;
  readonly maximumBadges?: number | ScreenSizeRangeMap<number>;
  readonly children: (model: M) => JSX.Element;
}

const partitionChildren = ({
  containerSize,
  maximumBadges,
  children,
}: Pick<BadgeCollectionChildrenProps, "maximumBadges" | "children"> & {
  readonly containerSize: number | null;
}): [JSX.Element[], JSX.Element[]] => {
  if (maximumBadges !== undefined && containerSize !== null) {
    const maxBadges =
      typeof maximumBadges === "number"
        ? maximumBadges
        : getFromContainerSizeRangeMap(containerSize, maximumBadges);
    if (maxBadges !== null) {
      return [children.slice(0, maxBadges), children.slice(maxBadges)];
    }
  }
  return [children, []];
};

export type BadgeCollectionProps<M> =
  | BadgeCollectionCallbackProps<M>
  | BadgeCollectionChildrenProps;

export const BadgeCollection = <M,>({
  data,
  children,
  ...props
}: BadgeCollectionProps<M>): JSX.Element => {
  const [state, setState] = useState<TypographyVisibilityState>("collapsed");
  const { ref, size: containerSize } = useContainerSizes<HTMLDivElement>();

  if (data !== undefined) {
    return (
      <BadgeCollection {...props}>
        {data.map((datum, i) => (
          <React.Fragment key={i}>{children(datum)}</React.Fragment>
        ))}
      </BadgeCollection>
    );
  } else if (typeof children === "function") {
    throw new TypeError("Invalid function implementation!");
  } else if (children.length === 0) {
    return <></>;
  }
  const { size, maximumBadges, ...rest } = props;
  const partition = partitionChildren({
    children,
    maximumBadges,
    containerSize,
  });
  return (
    <BaseTypography
      {...rest}
      ref={ref}
      component="div"
      className={classNames("badge-collection", `badge-collection--size-${size}`, props.className)}
    >
      <div className="badge-collection__badges">
        {state === "collapsed" ? partition[0] : [...partition[0], ...partition[1]]}
      </div>
      {partition[1].length !== 0 && (
        <ShowMoreLink
          state={state}
          onClick={() => setState(curr => (curr === "collapsed" ? "expanded" : "collapsed"))}
        />
      )}
    </BaseTypography>
  );
};
