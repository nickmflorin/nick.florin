import { forwardRef, type ForwardedRef } from "react";

import { type ApiSkill } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";
import { ReplacedSubstrings } from "~/components/typography/ReplacedSubstrings";

const getModelValue = (m: ApiSkill) => m.id;

export type SkillsSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiSkill,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface SkillsSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiSkill, { behavior: B; getModelValue: typeof getModelValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getModelValueLabel"
  > {
  readonly behavior: B;
}

const Label = ({
  skill,
  search,
  boldOptionsOnSearch = true,
}: {
  boldOptionsOnSearch?: boolean;
  skill: ApiSkill;
  search?: string;
}) => {
  if (boldOptionsOnSearch && search !== undefined) {
    return (
      <Text component="div" fontSize="sm" truncate>
        <ReplacedSubstrings substring={search} fontWeight="semibold">
          {skill.label}
        </ReplacedSubstrings>
      </Text>
    );
  }
  return (
    <Text fontSize="sm" truncate>
      {skill.label}
    </Text>
  );
};

export const SkillsSelect = forwardRef(
  <B extends SelectBehaviorType>(
    {
      behavior,
      includeDescriptions = true,
      boldOptionsOnSearch = true,
      search,
      ...props
    }: SkillsSelectProps<B>,
    ref: ForwardedRef<SkillsSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<ApiSkill, { behavior: B; getModelValue: typeof getModelValue }>
      summarizeValueAfter={2}
      {...props}
      search={search}
      ref={ref}
      options={{ behavior, getModelValue }}
      getModelValueLabel={m => m.label}
      includeDescriptions={false}
      itemRenderer={m =>
        includeDescriptions && m.description !== null && m.description.trim().length !== 0 ? (
          <div className="flex flex-col gap-[4px]">
            <Label skill={m} search={search} boldOptionsOnSearch={boldOptionsOnSearch} />
            <Description fontSize="xs" lineClamp={3}>
              {m.description}
            </Description>
          </div>
        ) : (
          <Label skill={m} search={search} boldOptionsOnSearch={boldOptionsOnSearch} />
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
