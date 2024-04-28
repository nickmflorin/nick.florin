import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { LegendItem } from "./LegendItem";

export interface ILegendItem {
  readonly label: string;
  readonly color: string;
}

export interface LegendProps extends ComponentProps {
  readonly items: ILegendItem[];
}

export const Legend = ({ items, ...props }: LegendProps) => (
  <div
    {...props}
    className={clsx("flex flex-wrap gap-y-[4px] gap-x-[6px] overflow-x-hidden", props.className)}
  >
    {items.map((item, i) => (
      <LegendItem key={i} {...item} />
    ))}
  </div>
);
