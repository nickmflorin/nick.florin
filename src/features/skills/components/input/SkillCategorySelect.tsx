import { type ForwardedRef, type JSX } from 'react';

import { type EnumeratedLiteralsModel } from 'enumerated-literals';

import { SkillCategories } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';

type M = EnumeratedLiteralsModel<typeof SkillCategories>;

const getModelValue = (m: M) => m.value;

export interface SkillCategorySelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<M, { behavior: B; getModelValue: typeof getModelValue }>,
  'data' | 'getModelValueLabel' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
}

export const SkillCategorySelect = <B extends SelectBehaviorType>({
  behavior,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<
    DataSelectInstance<M, { behavior: B; getModelValue: typeof getModelValue }>
  >;
} & SkillCategorySelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    data={[...SkillCategories.models]}
    getModelValueLabel={m => m.label}
    itemRenderer={m => m.label}
    options={{ behavior, getModelValue }}
    ref={ref}
  />
);
