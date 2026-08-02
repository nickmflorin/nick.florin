import { type ForwardedRef, type JSX } from 'react';

import { type EducationIncludes } from '~/database/model';
import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useEducations } from '~/hooks/api';

import {
  EducationSelect,
  type EducationSelectInstance,
  type EducationSelectProps,
} from './EducationSelect';

export interface ClientEducationSelectProps<
  B extends SelectBehaviorType,
  I extends EducationIncludes,
> extends Omit<EducationSelectProps<B, I>, 'data'> {
  readonly includes: I;
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientEducationSelect = <B extends SelectBehaviorType, I extends EducationIncludes>({
  includes,
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: ForwardedRef<EducationSelectInstance<B, I>>;
} & ClientEducationSelectProps<B, I>): JSX.Element => {
  const { data, error, isLoading } = useEducations({
    onError: e => {
      logger.error(e, 'There was an error loading the educations via the API.');
      onError?.(e);
    },
    query: { includes, visibility },
  });
  return (
    <EducationSelect<B, I>
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
