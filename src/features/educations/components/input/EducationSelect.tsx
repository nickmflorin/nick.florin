import { type ForwardedRef, type JSX } from 'react';

import { type ApiEducation, type EducationIncludes } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

const getModelValue = (m: ApiEducation) => m.id;

export type EducationSelectInstance<
  B extends SelectBehaviorType,
  I extends EducationIncludes,
> = DataSelectInstance<ApiEducation<I>, { behavior: B; getModelValue: typeof getModelValue }>;

export interface EducationSelectProps<
  B extends SelectBehaviorType,
  I extends EducationIncludes,
> extends Omit<
  DataSelectProps<ApiEducation<I>, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const EducationSelect = <B extends SelectBehaviorType, I extends EducationIncludes = []>({
  behavior,
  hasAbbreviatedLabels = true,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<EducationSelectInstance<B, I>>;
} & EducationSelectProps<B, I>): JSX.Element => (
  <DataSelect<ApiEducation<I>, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.shortMajor ?? m.major}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px] max-w-full'>
        <Text fontSize='sm' fontWeight='medium' whiteSpace='normal'>
          {hasAbbreviatedLabels ? (m.shortMajor ?? m.major) : m.major}
        </Text>
        <Description fontSize='xs' truncate>
          {m.school.name}
        </Description>
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
  />
);
