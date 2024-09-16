import React from "react";

import type { BadgeSize } from "./types";

import { classNames } from "~/components/types";
import {
  type ComponentProps,
  type TypographyCharacteristics,
  getTypographyClassName,
} from "~/components/types";

export interface BadgeCollectionChildrenProps
  extends ComponentProps,
    Omit<TypographyCharacteristics, "align" | "truncate" | "lineClamp"> {
  readonly children: JSX.Element[];
  readonly size?: BadgeSize;
  readonly data?: never;
}

export interface BadgeCollectionCallbackProps<M>
  extends ComponentProps,
    Omit<TypographyCharacteristics, "align" | "truncate" | "lineClamp"> {
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
  fontWeight,
  fontSize,
  transform,
  fontFamily,
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
    <div
      {...props}
      className={classNames(
        "badge-collection",
        `badge-collection--size-${size}`,
        getTypographyClassName({ fontSize, fontWeight, transform, fontFamily }),
        props.className,
      )}
    >
      {children}
    </div>
  ) : (
    <></>
  );
};
