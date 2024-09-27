import { forwardRef, type ForwardedRef } from "react";

import { type ApiSkill } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: ApiSkill) => m.id;

export type SkillsSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiSkill,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface SkillsSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiSkill, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getItemValueLabel"
  > {
  readonly behavior: B;
}

export const SkillsSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, includeDescriptions = true, ...props }: SkillsSelectProps<B>,
    ref: ForwardedRef<SkillsSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<ApiSkill, { behavior: B; getItemValue: typeof getItemValue }>
      summarizeValueAfter={2}
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.label}
      includeDescriptions={false}
      itemRenderer={m =>
        includeDescriptions && m.description !== null && m.description.trim().length !== 0 ? (
          <div className="flex flex-col gap-[4px]">
            <Text fontSize="sm" fontWeight="medium" truncate>
              {m.label}
            </Text>
            <Description fontSize="xs">{m.description}</Description>
          </div>
        ) : (
          <Text fontSize="sm" fontWeight="medium" truncate className="leading-[28px]">
            {m.label}
          </Text>
        )
      }
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: SkillsSelectProps<B> & {
      readonly ref?: ForwardedRef<SkillsSelectInstance<B>>;
    },
  ): JSX.Element;
};
