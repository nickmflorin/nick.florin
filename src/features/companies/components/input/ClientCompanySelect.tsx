import { type ForwardedRef, type JSX } from 'react';

import { logger } from '~/internal/logger';

import { type ActionVisibility } from '~/actions';
import { type ApiError } from '~/api';

import { type SelectBehaviorType } from '~/components/input/select';
import { useCompanies } from '~/hooks/api';

import {
  CompanySelect,
  type CompanySelectInstance,
  type CompanySelectProps,
} from './CompanySelect';

export interface ClientCompanySelectProps<B extends SelectBehaviorType> extends Omit<
  CompanySelectProps<B>,
  'data'
> {
  readonly onError?: (e: ApiError) => void;
  readonly visibility: ActionVisibility;
}

export const ClientCompanySelect = <B extends SelectBehaviorType>({
  onError,
  ref,
  visibility,
  ...props
}: {
  readonly ref?: ForwardedRef<CompanySelectInstance<B>>;
} & ClientCompanySelectProps<B>): JSX.Element => {
  const { data, error, isLoading } = useCompanies({
    onError: e => {
      logger.error(e, 'There was an error loading the companies via the API.');
      onError?.(e);
    },
    query: { includes: [], visibility },
  });

  return (
    <CompanySelect<B>
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
