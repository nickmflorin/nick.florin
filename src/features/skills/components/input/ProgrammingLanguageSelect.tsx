import { type JSX, type Ref } from 'react';

import { type EnumeratedLiteralsModel } from 'enumerated-literals';

import { ProgrammingLanguages } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';

type M = EnumeratedLiteralsModel<typeof ProgrammingLanguages>;

const getModelValue = (m: M) => m.value;

export interface ProgrammingLanguageSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<M, { behavior: B; getModelValue: typeof getModelValue }>,
  'data' | 'getItemIcon' | 'getModelValueLabel' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
}

export const ProgrammingLanguageSelect = <B extends SelectBehaviorType>({
  behavior,
  ref,
  ...props
}: {
  readonly ref?: Ref<DataSelectInstance<M, { behavior: B; getModelValue: typeof getModelValue }>>;
} & ProgrammingLanguageSelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    data={[...ProgrammingLanguages.models]}
    getItemIcon={m => m.icon}
    getModelValueLabel={m => m.label}
    itemRenderer={m => m.label}
    options={{ behavior, getModelValue }}
    ref={ref}
  />
);
