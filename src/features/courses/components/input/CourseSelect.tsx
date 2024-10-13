import { forwardRef, type ForwardedRef } from "react";

import { type Course } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getModelValue = (m: Course) => m.id;

export type CourseSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  Course,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface CourseSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<Course, { behavior: B; getModelValue: typeof getModelValue }>,
    "options" | "itemIsDisabled" | "getModelValueLabel" | "itemRenderer"
  > {
  readonly behavior: B;
  readonly useAbbreviatedLabels?: boolean;
}

export const CourseSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedLabels, includeDescriptions = true, ...props }: CourseSelectProps<B>,
    ref: ForwardedRef<CourseSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<Course, { behavior: B; getModelValue: typeof getModelValue }>
      {...props}
      ref={ref}
      options={{ behavior, getModelValue }}
      getModelValueLabel={m => m.shortName ?? m.name}
      includeDescriptions={false}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px]">
          <Text fontSize="sm" fontWeight="medium">
            {useAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
          </Text>
          {m.description && includeDescriptions && (
            <Description fontSize="xs" className="text-description">
              {m.description}
            </Description>
          )}
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: CourseSelectProps<B> & {
      readonly ref?: ForwardedRef<CourseSelectInstance<B>>;
    },
  ): JSX.Element;
};
