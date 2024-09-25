import { forwardRef, type ForwardedRef } from "react";

import { type ApiEducation } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: ApiEducation) => m.id;

export type EducationSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiEducation,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface EducationSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiEducation, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRendererer" | "getItemValueLabel"
  > {
  readonly behavior: B;
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const EducationSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedOptionLabels, ...props }: EducationSelectProps<B>,
    ref: ForwardedRef<
      DataSelectInstance<ApiEducation, { behavior: B; getItemValue: typeof getItemValue }>
    >,
  ): JSX.Element => (
    <DataSelect<ApiEducation, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.shortMajor ?? m.major}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px] max-w-full">
          <Text fontSize="sm" fontWeight="medium" whiteSpace="normal">
            {useAbbreviatedOptionLabels ? (m.shortMajor ?? m.major) : m.major}
          </Text>
          <Description fontSize="xs" truncate>
            {m.school.name}
          </Description>
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: EducationSelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<ApiEducation, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
