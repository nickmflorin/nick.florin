import { forwardRef, type ForwardedRef } from "react";

import { type ApiExperience } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: ApiExperience) => m.id;

export type ExperienceSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiExperience,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface ExperienceSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiExperience, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getItemValueLabel"
  > {
  readonly behavior: B;
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const ExperienceSelect = forwardRef(
  <B extends SelectBehaviorType>(
    {
      behavior,
      useAbbreviatedOptionLabels,
      includeDescriptions = true,
      ...props
    }: ExperienceSelectProps<B>,
    ref: ForwardedRef<
      DataSelectInstance<ApiExperience, { behavior: B; getItemValue: typeof getItemValue }>
    >,
  ): JSX.Element => (
    <DataSelect<ApiExperience, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      includeDescriptions={false}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.shortTitle ?? m.title}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px]">
          <Text fontSize="sm" fontWeight="medium">
            {useAbbreviatedOptionLabels ? (m.shortTitle ?? m.title) : m.shortTitle}
          </Text>
          {includeDescriptions && <Description fontSize="xs">{m.company.name}</Description>}
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: ExperienceSelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<ApiExperience, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
