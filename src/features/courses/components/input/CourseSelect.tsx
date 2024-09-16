import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";
import { type Course } from "~/prisma/model";

import { type HttpError } from "~/api";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";
import { useCourses } from "~/hooks";

const getItemValue = (m: Course) => m.id;

export interface CourseSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<Course, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "data"
  > {
  readonly behavior: B;
  readonly useAbbreviatedOptionLabels?: boolean;
  readonly onError?: (e: HttpError) => void;
}

export const CourseSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedOptionLabels, onError, ...props }: CourseSelectProps<B>,
    ref: ForwardedRef<
      DataSelectInstance<Course, { behavior: B; getItemValue: typeof getItemValue }>
    >,
  ): JSX.Element => {
    const { data, isLoading, error } = useCourses({
      query: { includes: [], visibility: "admin" },
      onError: e => {
        logger.error(e, "There was an error loading the courses via the API.");
        onError?.(e);
      },
    });

    return (
      <DataSelect<Course, { behavior: B; getItemValue: typeof getItemValue }>
        {...props}
        ref={ref}
        isReady={data !== undefined}
        data={data ?? []}
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
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
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: CourseSelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<Course, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
