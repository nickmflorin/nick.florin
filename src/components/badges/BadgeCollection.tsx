import React from "react";

import type { BadgeSize } from "./types";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { BaseTypography, type BaseTypographyProps } from "~/components/typography/BaseTypography";

export interface BadgeCollectionChildrenProps
  extends ComponentProps,
    Omit<BaseTypographyProps<"div">, "lineClamp" | "align" | "truncate" | "component"> {
  readonly children: JSX.Element[];
  readonly size?: BadgeSize;
  readonly data?: never;
}

export interface BadgeCollectionCallbackProps<M>
  extends ComponentProps,
    Omit<
      BaseTypographyProps<"div">,
      "lineClamp" | "align" | "truncate" | "children" | "component"
    > {
  readonly data: M[];
  readonly size?: BadgeSize;
  readonly children: (model: M) => JSX.Element;
}

export type BadgeCollectionProps<M> =
  | BadgeCollectionCallbackProps<M>
  | BadgeCollectionChildrenProps;

export const BadgeCollection = <M,>({
  data,
  children,
  size,
  ...props
}: BadgeCollectionProps<M>): JSX.Element => {
  if (data !== undefined) {
    return data.length === 0 ? (
      <></>
    ) : (
      <div
        {...props}
        className={classNames("flex flex-wrap gap-y-[4px] gap-x-[4px]", props.className)}
      >
        {data.map((datum, i) => (
          <React.Fragment key={i}>{children(datum)}</React.Fragment>
        ))}
      </div>
    );
  } else if (typeof children === "function") {
    throw new TypeError("Invalid function implementation!");
  }
  return children.length !== 0 ? (
    <BaseTypography
      {...props}
      component="div"
      className={classNames("badge-collection", `badge-collection--size-${size}`, props.className)}
    >
      {children}
    </BaseTypography>
  ) : (
    <></>
  );
};
