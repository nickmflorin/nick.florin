import { type ForwardedRef, type JSX } from 'react';

import { type Course } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

const getModelValue = (m: Course) => m.id;

export type CourseSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  Course,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface CourseSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<Course, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const CourseSelect = <B extends SelectBehaviorType>({
  behavior,
  hasAbbreviatedLabels,
  ref,
  shouldIncludeDescriptions = true,
  ...props
}: {
  readonly ref?: ForwardedRef<CourseSelectInstance<B>>;
} & CourseSelectProps<B>): JSX.Element => (
  <DataSelect<Course, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.shortName ?? m.name}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px]'>
        <Text fontSize='sm' fontWeight='medium'>
          {hasAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
        </Text>
        {m.description && shouldIncludeDescriptions ? (
          <Description className='text-description' fontSize='xs'>
            {m.description}
          </Description>
        ) : null}
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
    shouldIncludeDescriptions={false}
  />
);
