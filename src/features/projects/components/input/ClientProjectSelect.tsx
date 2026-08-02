import { type ForwardedRef, type JSX } from 'react';

import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useProjects } from '~/hooks/api';

import {
  ProjectSelect,
  type ProjectSelectInstance,
  type ProjectSelectProps,
} from './ProjectSelect';

export interface ClientProjectSelectProps<B extends SelectBehaviorType> extends Omit<
  ProjectSelectProps<B>,
  'data'
> {
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientProjectSelect = <B extends SelectBehaviorType>({
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: ForwardedRef<ProjectSelectInstance<B>>;
} & ClientProjectSelectProps<B>): JSX.Element => {
  const { data, error, isLoading } = useProjects({
    onError: e => {
      logger.error(e, 'There was an error loading the projects via the API.');
      onError?.(e);
    },
    query: { includes: [], visibility },
  });

  return (
    <ProjectSelect<B>
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
