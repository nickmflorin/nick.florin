import { forwardRef, type ForwardedRef } from "react";

import { type ApiExperience, type ExperienceIncludes } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: ApiExperience) => m.id;

export type ExperienceSelectInstance<
  B extends SelectBehaviorType,
  I extends ExperienceIncludes,
> = DataSelectInstance<ApiExperience<I>, { behavior: B; getItemValue: typeof getItemValue }>;

export interface ExperienceSelectProps<B extends SelectBehaviorType, I extends ExperienceIncludes>
  extends Omit<
    DataSelectProps<ApiExperience<I>, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getItemValueLabel"
  > {
  readonly behavior: B;
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const ExperienceSelect = forwardRef(
  <B extends SelectBehaviorType, I extends ExperienceIncludes>(
    {
      behavior,
      useAbbreviatedOptionLabels,
      includeDescriptions = true,
      ...props
    }: ExperienceSelectProps<B, I>,
    ref: ForwardedRef<ExperienceSelectInstance<B, I>>,
  ): JSX.Element => (
    <DataSelect<ApiExperience<I>, { behavior: B; getItemValue: typeof getItemValue }>
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
  <B extends SelectBehaviorType, I extends ExperienceIncludes>(
    props: ExperienceSelectProps<B, I> & {
      readonly ref?: ForwardedRef<ExperienceSelectInstance<B, I>>;
    },
  ): JSX.Element;
};
