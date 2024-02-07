import clsx from "clsx";

import { CircleIcon } from "~/components/icons/CircleIcon";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

export interface ILegendItem {
  readonly label: string;
  readonly color: string;
}

export interface LegendProps extends ComponentProps {
  readonly items: ILegendItem[];
}

export const LegendItem = ({ color, label }: ILegendItem) => (
  <div className="flex flex-row gap-[3px]">
    <CircleIcon color={color} size={18} />
    <Label size="sm" fontWeight="regular" className="leading-[18px]" fontFamily="inter">
      {label}
    </Label>
  </div>
);

export const Legend = ({ items, ...props }: LegendProps) => (
  <div {...props} className={clsx("flex flex-wrap gap-y-[4px] gap-x-[6px]", props.className)}>
    {items.map((item, i) => (
      <LegendItem key={i} {...item} />
    ))}
  </div>
);
