import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import type { ActionVisibility } from "~/actions";
import { type ApiError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { useCourses } from "~/hooks/api";

import { CourseSelect, type CourseSelectInstance, type CourseSelectProps } from "./CourseSelect";

export interface ClientCourseSelectProps<B extends SelectBehaviorType>
  extends Omit<CourseSelectProps<B>, "data"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: ApiError) => void;
}

export const ClientCourseSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientCourseSelectProps<B>,
    ref: ForwardedRef<CourseSelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useCourses({
      query: { includes: [], visibility },
      onError: e => {
        logger.error(e, "There was an error loading the courses via the API.");
        onError?.(e);
      },
    });

    return (
      <CourseSelect<B>
        {...props}
        ref={ref}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        isLoading={isLoading || props.isLoading}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ClientCourseSelectProps<B> & {
      readonly ref?: ForwardedRef<CourseSelectInstance<B>>;
    },
  ): JSX.Element;
};
