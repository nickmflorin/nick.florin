import { type JSX, type Ref } from 'react';

import { type School, stringifyLocation } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

const getModelValue = (m: School) => m.id;

export type SchoolSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  School,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface SchoolSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<School, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const SchoolSelect = <B extends SelectBehaviorType>({
  behavior,
  hasAbbreviatedLabels,
  ref,
  ...props
}: {
  readonly ref?: Ref<SchoolSelectInstance<B>>;
} & SchoolSelectProps<B>): JSX.Element => (
  <DataSelect<School, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.shortName ?? m.name}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px]'>
        <Text fontSize='sm' fontWeight='medium'>
          {hasAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
        </Text>
        <Description fontSize='xs'>
          {stringifyLocation({ city: m.city, state: m.state })}
        </Description>
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
  />
);
