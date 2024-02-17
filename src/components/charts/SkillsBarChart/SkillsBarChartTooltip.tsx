"use client";
import { TooltipContent } from "~/components/floating/TooltipContent";
import { Circle } from "~/components/icons/svgs";
import { Label } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";

export const SkillsBarChartTooltip = (props: {
  color: string;
  data: { experience: number; skill: string };
}) => (
  <TooltipContent variant="secondary" className="flex flex-row gap-[4px] items-center">
    <div className="flex flex-row gap-[2px] items-center">
      <Circle color={props.color} size={12} />
      <Label size="xs" className="leading-[14px]">
        {props.data.skill}
      </Label>
    </div>
    <Text
      size="xs"
      fontWeight="bold"
      className="leading-[14px]"
    >{`${props.data.experience} years`}</Text>
  </TooltipContent>
);
