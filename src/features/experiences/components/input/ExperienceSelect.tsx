import { type ForwardedRef, type JSX } from 'react';

import { type Company, type Experience } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

/**
 * The minimal experience shape the select renders. Callers may provide any superset — the full
 * `ApiExperience` rows the admin tables fetch satisfy it structurally — while server fetchers that
 * exist only to feed this select can project down to exactly these fields.
 */
export type ExperienceSelectModel = {
  readonly company: Pick<Company, 'name'>;
} & Pick<Experience, 'id' | 'shortTitle' | 'title'>;

const getModelValue = (m: ExperienceSelectModel) => m.id;

export type ExperienceSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ExperienceSelectModel,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface ExperienceSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<ExperienceSelectModel, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const ExperienceSelect = <B extends SelectBehaviorType>({
  behavior,
  hasAbbreviatedLabels,
  ref,
  shouldIncludeDescriptions = true,
  ...props
}: {
  readonly ref?: ForwardedRef<ExperienceSelectInstance<B>>;
} & ExperienceSelectProps<B>): JSX.Element => (
  <DataSelect<ExperienceSelectModel, { behavior: B; getModelValue: typeof getModelValue }>
    {...props}
    getModelValueLabel={m => m.shortTitle ?? m.title}
    itemRenderer={m => (
      <div className='flex flex-col gap-[4px]'>
        <Text fontSize='sm' fontWeight='medium'>
          {hasAbbreviatedLabels ? (m.shortTitle ?? m.title) : m.shortTitle}
        </Text>
        {shouldIncludeDescriptions ? (
          <Description fontSize='xs'>{m.company.name}</Description>
        ) : null}
      </div>
    )}
    options={{ behavior, getModelValue }}
    ref={ref}
    shouldIncludeDescriptions={false}
  />
);
