import { type JSX, type Ref } from 'react';

import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useCourses } from '~/hooks/api';

import { CourseSelect, type CourseSelectInstance, type CourseSelectProps } from './CourseSelect';

export interface ClientCourseSelectProps<B extends SelectBehaviorType> extends Omit<
  CourseSelectProps<B>,
  'data'
> {
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientCourseSelect = <B extends SelectBehaviorType>({
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: Ref<CourseSelectInstance<B>>;
} & ClientCourseSelectProps<B>): JSX.Element => {
  const { data, error, isLoading } = useCourses({
    onError: e => {
      logger.error(e, 'There was an error loading the courses via the API.');
      onError?.(e);
    },
    query: { includes: [], visibility },
  });

  return (
    <CourseSelect<B>
      {...props}
      data={data ?? []}
      isDisabled={error !== undefined || props.isDisabled}
      isLoading={isLoading || props.isLoading}
      isLocked={isLoading || props.isLocked}
      isReady={data !== undefined && props.isReady !== false}
      ref={ref}
    />
  );
};
