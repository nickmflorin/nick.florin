import { type JSX, type Ref } from 'react';

import { type Company, stringifyLocation } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

const getModelValue = (m: Company) => m.id;

export type CompanySelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  Company,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface CompanySelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<Company, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const CompanySelect = <B extends SelectBehaviorType>({
  behavior,
  hasAbbreviatedLabels,
  ref,
  shouldIncludeDescriptions = true,
  ...props
}: {
  readonly ref?: Ref<CompanySelectInstance<B>>;
} & CompanySelectProps<B>): JSX.Element => (
  <DataSelect<Company, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.shortName ?? m.name}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px]'>
        <Text fontSize='sm' fontWeight='medium'>
          {hasAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
        </Text>
        {shouldIncludeDescriptions && (
          <Description fontSize='xs'>
            {stringifyLocation({ city: m.city, state: m.state })}
          </Description>
        )}
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
    shouldIncludeDescriptions={false}
  />
);
