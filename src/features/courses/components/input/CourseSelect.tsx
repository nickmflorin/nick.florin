import { forwardRef, type ForwardedRef } from "react";

import { type Course } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: Course) => m.id;

export type CourseSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  Course,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface CourseSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<Course, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "getItemValueLabel" | "itemRenderer"
  > {
  readonly behavior: B;
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const CourseSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedOptionLabels, ...props }: CourseSelectProps<B>,
    ref: ForwardedRef<CourseSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<Course, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.shortName ?? m.name}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px]">
          <Text fontSize="sm" fontWeight="medium">
            {useAbbreviatedOptionLabels ? (m.shortName ?? m.name) : m.name}
          </Text>
          {m.description && (
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
