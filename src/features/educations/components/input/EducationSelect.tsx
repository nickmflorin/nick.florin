import { forwardRef, type ForwardedRef } from "react";

import { type ApiEducation, type EducationIncludes } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: ApiEducation) => m.id;

export type EducationSelectInstance<
  B extends SelectBehaviorType,
  I extends EducationIncludes,
> = DataSelectInstance<ApiEducation<I>, { behavior: B; getItemValue: typeof getItemValue }>;

export interface EducationSelectProps<B extends SelectBehaviorType, I extends EducationIncludes>
  extends Omit<
    DataSelectProps<ApiEducation<I>, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRendererer" | "getItemValueLabel"
  > {
  readonly behavior: B;
  readonly useAbbreviatedLabels?: boolean;
}

export const EducationSelect = forwardRef(
  <B extends SelectBehaviorType, I extends EducationIncludes>(
    { behavior, useAbbreviatedLabels = true, ...props }: EducationSelectProps<B, I>,
    ref: ForwardedRef<EducationSelectInstance<B, I>>,
  ): JSX.Element => (
    <DataSelect<ApiEducation<I>, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.shortMajor ?? m.major}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px] max-w-full">
          <Text fontSize="sm" fontWeight="medium" whiteSpace="normal">
            {useAbbreviatedLabels ? (m.shortMajor ?? m.major) : m.major}
          </Text>
          <Description fontSize="xs" truncate>
            {m.school.name}
          </Description>
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType, I extends EducationIncludes>(
    props: EducationSelectProps<B, I> & {
      readonly ref?: ForwardedRef<EducationSelectInstance<B, I>>;
    },
  ): JSX.Element;
};
