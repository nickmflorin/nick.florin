import { type ForwardedRef, type JSX } from 'react';

import { type EnumeratedLiteralsModel } from 'enumerated-literals';

import { Degrees } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';

type M = EnumeratedLiteralsModel<typeof Degrees>;

const getModelValue = (m: M) => m.value;

export type DegreeSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  M,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface DegreeSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<M, { behavior: B; getModelValue: typeof getModelValue }>,
  'data' | 'getModelValueLabel' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
}

export const DegreeSelect = <B extends SelectBehaviorType>({
  behavior,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<DegreeSelectInstance<B>>;
} & DegreeSelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    data={[...Degrees.models]}
    getModelValueLabel={m => m.shortLabel}
    itemRenderer={m => m.label}
    options={{ behavior, getModelValue }}
    ref={ref}
  />
);
