import { Icon } from "~/components/icons/Icon";
import { Circle } from "~/components/icons/svgs";
import { Label } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";

import { type SkillsBarChartDatum } from "./types";

export const SkillsBarChartTooltip = (props: { color: string; data: SkillsBarChartDatum }) => (
  <>
    <div className="flex flex-row gap-[4px] items-center">
      <div className="flex flex-row gap-[4px] items-center max-w-fit">
        <Circle color={props.color} size={12} />
        <Label fontSize="xs" className="leading-[14px]">
          {props.data.label}
        </Label>
      </div>
      <Text
        fontSize="xs"
        fontWeight="bold"
        className="leading-[14px]"
      >{`${props.data.experience} years`}</Text>
    </div>
    <div className="flex flex-row gap-[4px] items-flex-start w-[200px]">
      <Icon name="info-circle" size="sm" className="text-blue-400" />
      <Text fontSize="xs" className="text-body-light leading-[14px]">
        Click the bar for more info.
      </Text>
    </div>
  </>
);

export default SkillsBarChartTooltip;
