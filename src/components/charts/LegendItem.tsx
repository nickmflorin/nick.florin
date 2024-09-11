"use client";
import { Circle } from "~/components/icons/svgs";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

export interface LegendItemProps extends ComponentProps {
  readonly label: string;
  readonly color: string;
}

export const LegendItem = ({ color, label, ...props }: LegendItemProps) => {
  const { isLessThanOrEqualTo } = useScreenSizes({});
  return (
    <div
      className={classNames(
        "flex flex-row items-center gap-[3px]",
        { "h-[16px]": isLessThanOrEqualTo("sm"), "h-[18px]": !isLessThanOrEqualTo("sm") },
        props.className,
      )}
    >
      <Circle color={color} size={isLessThanOrEqualTo("sm") ? 16 : 18} />
      <Label
        fontSize={isLessThanOrEqualTo("sm") ? "xs" : "sm"}
        truncate
        fontWeight="regular"
        className={classNames({
          "leading-[16px]": isLessThanOrEqualTo("sm"),
          "leading-[18px]": !isLessThanOrEqualTo("sm"),
        })}
        fontFamily="inter"
      >
        {label}
      </Label>
    </div>
  );
};
