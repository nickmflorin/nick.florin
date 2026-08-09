import { type ForwardedRef, type JSX } from 'react';

import { type Education, type School } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';

/**
 * The minimal education shape the select renders. Callers may provide any superset — the full
 * `ApiEducation` rows the admin tables fetch satisfy it structurally — while server fetchers that
 * exist only to feed this select can project down to exactly these fields.
 */
export type EducationSelectModel = {
  readonly school: Pick<School, 'name'>;
} & Pick<Education, 'id' | 'major' | 'shortMajor'>;

const getModelValue = (m: EducationSelectModel) => m.id;

export type EducationSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  EducationSelectModel,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface EducationSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<EducationSelectModel, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
  readonly hasAbbreviatedLabels?: boolean;
}

export const EducationSelect = <B extends SelectBehaviorType>({
  behavior,
  hasAbbreviatedLabels = true,
  ref,
  ...props
}: {
  readonly ref?: ForwardedRef<EducationSelectInstance<B>>;
} & EducationSelectProps<B>): JSX.Element => (
  <DataSelect<EducationSelectModel, { behavior: B; getModelValue: typeof getModelValue }>
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
