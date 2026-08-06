import { type JSX, type Ref } from 'react';

import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useRepositories } from '~/hooks/api';

import {
  RepositorySelect,
  type RepositorySelectInstance,
  type RepositorySelectProps,
} from './RepositorySelect';

export interface ClientRepositorySelectProps<B extends SelectBehaviorType> extends Omit<
  RepositorySelectProps<B>,
  'data'
> {
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientRepositorySelect = <B extends SelectBehaviorType>({
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: Ref<RepositorySelectInstance<B>>;
} & ClientRepositorySelectProps<B>): JSX.Element => {
  const { data, error, isLoading } = useRepositories({
    onError: e => {
      logger.error(e, 'There was an error loading the repositories via the API.');
      onError?.(e);
    },
    query: { includes: [], visibility },
  });

  return (
    <RepositorySelect<B>
      {...props}
      data={data ?? []}
      isDisabled={error !== undefined || props.isDisabled}
      isLoading={isLoading || props.isLoading}
      /* Loading does not lock the select ('locked' removes pointer events): it stays interactive
         so it can be opened before the data arrives, with the menu showing its loading state. */
      isLocked={props.isLocked}
      isReady={data === undefined ? false : props.isReady !== false}
      ref={ref}
    />
  );
};
