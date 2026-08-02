import { type JSX, useEffect } from 'react';

import { type ApiSkill } from '~/database/model';

import { type ExtendingDrawerProps } from '~/components/drawers';
import { Drawer } from '~/components/drawers/Drawer';
import { useForm } from '~/components/forms-v2/hooks';
import { Loading } from '~/components/loading/Loading';
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from '~/features/skills/components/forms/SkillsChartFilterForm';

export interface SkillsFilterDrawerProps extends ExtendingDrawerProps {
  readonly filters: SkillsChartFilterFormValues;
  readonly hasFiltersChanged: boolean;
  readonly isLoading?: boolean;
  readonly onChange: (filters: SkillsChartFilterFormValues) => void;
  readonly onClear: () => void;
  readonly skills: ApiSkill<[]>[];
}

export const SkillsFilterDrawer = ({
  filters,
  hasFiltersChanged,
  isLoading,
  onChange,
  onClear,
  onClose,
  skills,
}: SkillsFilterDrawerProps): JSX.Element => {
  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    defaultValues: { showTopSkills: 'all' },
    onChange: ({ values }) => onChange(values),
    schema: SkillsChartFilterFormSchema,
  });

  useEffect(() => {
    setValues(filters);
  }, [filters, setValues]);

  return (
    <Drawer onClose={onClose}>
      <Drawer.Header>Filters</Drawer.Header>
      <Drawer.Content className='overflow-y-auto'>
        <Loading className='z-auto' isLoading={isLoading}>
          <SkillsChartFilterForm
            form={{ ...form, setValues }}
            isClearDisabled={!hasFiltersChanged}
            onClear={onClear}
            skills={skills}
          />
        </Loading>
      </Drawer.Content>
    </Drawer>
  );
};
