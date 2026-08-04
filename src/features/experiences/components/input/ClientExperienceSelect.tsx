import { type ForwardedRef, type JSX } from 'react';

import { type ExperienceIncludes } from '~/database/model';
import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useExperiences } from '~/hooks/api';

import {
  ExperienceSelect,
  type ExperienceSelectInstance,
  type ExperienceSelectProps,
} from './ExperienceSelect';

export interface ClientExperienceSelectProps<
  B extends SelectBehaviorType,
  I extends ExperienceIncludes,
> extends Omit<ExperienceSelectProps<B, I>, 'data'> {
  readonly includes: I;
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientExperienceSelect = <B extends SelectBehaviorType, I extends ExperienceIncludes>({
  includes,
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: ForwardedRef<ExperienceSelectInstance<B, I>>;
} & ClientExperienceSelectProps<B, I>): JSX.Element => {
  const { data, error, isLoading } = useExperiences({
    onError: e => {
      logger.error(e, 'There was an error loading the experiences via the API.');
      onError?.(e);
    },
    query: { includes, visibility },
  });
  return (
    <ExperienceSelect
      {...props}
      data={data ?? []}
      isDisabled={error !== undefined || props.isDisabled}
      isLoading={isLoading || props.isLoading}
      isLocked={isLoading || props.isLocked}
      isReady={data === undefined ? false : props.isReady !== false}
      ref={ref}
    />
  );
};
