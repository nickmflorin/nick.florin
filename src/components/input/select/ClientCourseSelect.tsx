"use client";
import { type HttpError } from "~/api";
import { useCourses } from "~/hooks";

import { CourseSelect, type CourseSelectProps } from "./CourseSelect";

export interface ClientCourseSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<CourseSelectProps<O>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientCourseSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  onError,
  ...props
}: ClientCourseSelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useCourses({
    onError,
    query: { includes: [], visibility: "admin" },
  });
  return (
    <CourseSelect
      {...props}
      data={data ?? []}
      isReady={data !== undefined}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
