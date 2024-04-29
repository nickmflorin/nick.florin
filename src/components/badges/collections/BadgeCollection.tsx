import React from "react";

import clsx from "clsx";

import {
  type ComponentProps,
  type BaseTypographyProps,
  FontWeights,
  BodyFontSizes,
  getTypographyClassName,
} from "~/components/types";

export interface BadgeCollectionChildrenProps extends ComponentProps, BaseTypographyProps {
  readonly children: JSX.Element[];
  readonly data?: never;
}

export interface BadgeCollectionCallbackProps<M> extends ComponentProps, BaseTypographyProps {
  readonly data: M[];
  readonly children: (model: M) => JSX.Element;
}

export type BadgeCollectionProps<M> =
  | BadgeCollectionCallbackProps<M>
  | BadgeCollectionChildrenProps;

export const BadgeCollection = <M,>({
  data,
  children,
  fontWeight = FontWeights.MEDIUM,
  fontSize = BodyFontSizes.SM,
  transform,
  fontFamily,
  ...props
}: BadgeCollectionProps<M>): JSX.Element => {
  if (data !== undefined) {
    return data.length === 0 ? (
      <></>
    ) : (
      <div {...props} className={clsx("flex flex-wrap gap-y-[4px] gap-x-[4px]", props.className)}>
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
      className={clsx(
        "badge-collection",
        `badge-collection--size-${fontSize}`,
        // Omit the font size prop because it is handled by the badge size.
        getTypographyClassName({ fontWeight, transform, fontFamily }),
        props.className,
      )}
    >
      {children}
    </div>
  ) : (
    <></>
  );
};
