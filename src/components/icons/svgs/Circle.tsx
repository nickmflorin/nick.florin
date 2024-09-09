import React from "react";

import clsx from "clsx";

import { type HexColor } from "~/lib/colors";

import { type ComponentProps } from "~/components/types";

export type CircleProps = ComponentProps & {
  readonly color?: string;
  readonly size: number;
  readonly selected?: boolean;
  readonly selectable?: boolean;
  readonly selectedColor?: HexColor;
};

export const Circle = ({
  color,
  selectedColor = "#6eb6ff",
  selectable,
  selected,
  size,
  ...props
}: CircleProps) => (
  <svg
    {...props}
    className={clsx("icon", props.className)}
    style={{ ...props.style, height: `${size}px`, width: `${size}px` }}
  >
    {(selectable || selected !== undefined) && (
      <rect
        height={size}
        width={size}
        fill={selected ? selectedColor : "transparent"}
        rx={size / 2}
        ry={size / 2}
      />
    )}
    <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={color} />
  </svg>
);
