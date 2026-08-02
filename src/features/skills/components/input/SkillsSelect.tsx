import { type ForwardedRef, type JSX } from 'react';

import { type ApiSkill } from '~/database/model';

import { type DataSelectInstance, type SelectBehaviorType } from '~/components/input/select';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';
import { Description, Text } from '~/components/typography';
import { ReplacedSubstrings } from '~/components/typography/ReplacedSubstrings';

const getModelValue = (m: ApiSkill) => m.id;

export type SkillsSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiSkill,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface SkillsSelectProps<B extends SelectBehaviorType> extends Omit<
  DataSelectProps<ApiSkill, { behavior: B; getModelValue: typeof getModelValue }>,
  'getModelValueLabel' | 'itemIsDisabled' | 'itemRenderer' | 'options'
> {
  readonly behavior: B;
}

const Label = ({
  search,
  shouldBoldOptionsOnSearch = true,
  skill,
}: {
  readonly search?: string;
  readonly shouldBoldOptionsOnSearch?: boolean;
  readonly skill: ApiSkill;
}) => {
  if (shouldBoldOptionsOnSearch && search !== undefined) {
    return (
      <Text component='div' fontSize='sm' truncate>
        <ReplacedSubstrings fontWeight='semibold' substring={search}>
          {skill.label}
        </ReplacedSubstrings>
      </Text>
    );
  }
  return (
    <Text fontSize='sm' truncate>
      {skill.label}
    </Text>
  );
};

export const SkillsSelect = <B extends SelectBehaviorType>({
  behavior,
  ref,
  search,
  shouldBoldOptionsOnSearch = true,
  shouldIncludeDescriptions = true,
  ...props
}: {
  readonly ref?: ForwardedRef<SkillsSelectInstance<B>>;
} & SkillsSelectProps<B>): JSX.Element => (
  <DataSelect<ApiSkill, { behavior: B; getModelValue: typeof getModelValue }>
    summarizeValueAfter={2}
    {...props}
    getModelValueLabel={m => m.label}
    itemRenderer={m =>
      shouldIncludeDescriptions && m.description !== null && m.description.trim().length !== 0 ? (
        <div className='flex flex-col gap-[4px]'>
          <Label search={search} shouldBoldOptionsOnSearch={shouldBoldOptionsOnSearch} skill={m} />
          <Description fontSize='xs' lineClamp={3}>
            {m.description}
          </Description>
        </div>
      ) : (
        <Label search={search} shouldBoldOptionsOnSearch={shouldBoldOptionsOnSearch} skill={m} />
      )
    }
    options={{ behavior, getModelValue }}
    ref={ref}
    search={search}
    shouldIncludeDescriptions={false}
  />
);
