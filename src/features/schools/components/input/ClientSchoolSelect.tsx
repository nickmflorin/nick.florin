import { type ForwardedRef, type JSX } from 'react';

import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useSchools } from '~/hooks/api';

import { SchoolSelect, type SchoolSelectInstance, type SchoolSelectProps } from './SchoolSelect';

export interface ClientSchoolSelectProps<B extends SelectBehaviorType> extends Omit<
  SchoolSelectProps<B>,
  'data'
> {
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientSchoolSelect = <B extends SelectBehaviorType>({
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: ForwardedRef<SchoolSelectInstance<B>>;
} & ClientSchoolSelectProps<B>): JSX.Element => {
  const { data, error, isLoading } = useSchools({
    onError: e => {
      logger.error(e, 'There was an error loading the schools via the API.');
      onError?.(e);
    },
    query: { includes: [], visibility },
  });

  return (
    <SchoolSelect<B>
      {...props}
      data={data ?? []}
      isDisabled={error !== undefined || props.isDisabled}
      isLoading={isLoading || props.isLoading}
      /* Loading does not lock the select: it stays interactive so it can be opened before the data
         arrives, with the menu showing its loading state. */
      isLocked={props.isLocked}
      isReady={data === undefined ? false : props.isReady !== false}
      ref={ref}
    />
  );
};
