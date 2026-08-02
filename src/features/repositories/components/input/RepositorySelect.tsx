import { type ForwardedRef, type JSX } from 'react';

import { type ApiRepository } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { RepositoryTile } from '~/features/repositories/components/RepositoryTile';

const getModelValue = (m: ApiRepository) => m.id;

export type RepositorySelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiRepository,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface RepositorySelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<ApiRepository, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options' | 'shouldIncludeDescriptions'
> {
  readonly behavior: B;
}

export const RepositorySelect = <B extends SelectBehaviorType>({
  behavior,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<RepositorySelectInstance<B>>;
} & RepositorySelectProps<B>): JSX.Element => (
  <DataSelect<ApiRepository, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.slug}
    itemRenderer={m => (
      <RepositoryTile
        className='items-center gap-[8px]'
        iconSize={22}
        isDescriptionVisible={false}
        isLinkVisible={false}
        isNpmLinkVisible={false}
        repository={m}
      />
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
    shouldIncludeDescriptions={false}
  />
);
