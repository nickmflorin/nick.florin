import { type ForwardedRef, type JSX } from 'react';

import { type ApiExperience, type ExperienceIncludes } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

const getModelValue = (m: ApiExperience) => m.id;

export type ExperienceSelectInstance<
  B extends SelectBehaviorType,
  I extends ExperienceIncludes,
> = DataSelectInstance<ApiExperience<I>, { behavior: B; getModelValue: typeof getModelValue }>;

export interface ExperienceSelectProps<
  B extends SelectBehaviorType,
  I extends ExperienceIncludes,
> extends Omit<
  DataSelectProps<ApiExperience<I>, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const ExperienceSelect = <B extends SelectBehaviorType, I extends ExperienceIncludes = []>({
  behavior,
  hasAbbreviatedLabels,
  ref,
  shouldIncludeDescriptions = true,
  ...props
}: {
  readonly ref?: ForwardedRef<ExperienceSelectInstance<B, I>>;
} & ExperienceSelectProps<B, I>): JSX.Element => (
  <DataSelect<ApiExperience<I>, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.shortTitle ?? m.title}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px]'>
        <Text fontSize='sm' fontWeight='medium'>
          {hasAbbreviatedLabels ? (m.shortTitle ?? m.title) : m.shortTitle}
        </Text>
        {shouldIncludeDescriptions && <Description fontSize='xs'>{m.company.name}</Description>}
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
    shouldIncludeDescriptions={false}
  />
);
