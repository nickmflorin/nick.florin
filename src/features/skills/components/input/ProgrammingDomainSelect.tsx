import { type ForwardedRef, type JSX } from 'react';

import { type EnumeratedLiteralsModel } from 'enumerated-literals';

import { ProgrammingDomains } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';

type M = EnumeratedLiteralsModel<typeof ProgrammingDomains>;

const getModelValue = (m: M) => m.value;

export interface ProgrammingDomainSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<M, { behavior: B; getModelValue: typeof getModelValue }>,
  'data' | 'getModelValueLabel' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
}

export const ProgrammingDomainSelect = <B extends SelectBehaviorType>({
  behavior,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<
    DataSelectInstance<M, { behavior: B; getModelValue: typeof getModelValue }>
  >;
} & ProgrammingDomainSelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    data={[...ProgrammingDomains.models]}
    getModelValueLabel={m => m.label}
    itemRenderer={m => m.label}
    options={{ behavior, getModelValue }}
    ref={ref}
  />
);
