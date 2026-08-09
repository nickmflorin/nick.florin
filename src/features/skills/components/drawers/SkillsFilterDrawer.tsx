import { type JSX, useEffect } from 'react';

import { type ApiSkill } from '~/database/model';

import { type ExtendingDrawerProps } from '~/components/drawers';
import { Drawer } from '~/components/drawers/Drawer';
import { useForm } from '~/components/forms-v2/hooks';
import { Loading } from '~/components/loading/Loading';
import { type EducationSelectModel } from '~/features/educations/components/input/EducationSelect';
import { type ExperienceSelectModel } from '~/features/experiences/components/input/ExperienceSelect';
import {
  SkillsChartFilterDebounceDelay,
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from '~/features/skills/components/forms/SkillsChartFilterForm';
import { useDebounceCallback, useUnmount } from '~/hooks';

export interface SkillsFilterDrawerProps extends ExtendingDrawerProps {
  readonly educationsPromise: Promise<EducationSelectModel[] | null>;
  readonly experiencesPromise: Promise<ExperienceSelectModel[] | null>;
  readonly filters: SkillsChartFilterFormValues;
  readonly hasFiltersChanged: boolean;
  readonly isLoading?: boolean;
  readonly onChange: (filters: SkillsChartFilterFormValues) => void;
  readonly onClear: () => void;
  readonly skills: ApiSkill<[]>[];
}

export const SkillsFilterDrawer = ({
  educationsPromise,
  experiencesPromise,
  filters,
  hasFiltersChanged,
  isLoading,
  onChange,
  onClear,
  onClose,
  skills,
}: SkillsFilterDrawerProps): JSX.Element => {
  /* Form changes reach the chart only after a pause in activity, so a burst of select toggles
     produces one refetch; closing the drawer flushes whatever is pending. */
  const debouncedOnChange = useDebounceCallback(onChange, SkillsChartFilterDebounceDelay);

  /* Unlike the popover, the drawer unmounts when it closes - through whichever path closed it -
     so the pending changes are flushed on unmount rather than on an explicit close callback. */
  useUnmount(() => debouncedOnChange.flush());

  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    defaultValues: { showTopSkills: 'all' },
    onChange: ({ values }) => debouncedOnChange(values),
    schema: SkillsChartFilterFormSchema,
  });

  /* An externally-driven filters change (the module header's Clear button) supersedes anything
     pending here, so the pending call is cancelled before the form is synced - otherwise its
     stale values would apply on top of the external update. */
  useEffect(() => {
    debouncedOnChange.cancel();
    setValues(filters);
  }, [filters, setValues, debouncedOnChange]);

  return (
    <Drawer onClose={onClose}>
      <Drawer.Header>Filters</Drawer.Header>
      <Drawer.Content className='overflow-y-auto'>
        <Loading className='z-auto' isLoading={isLoading}>
          <SkillsChartFilterForm
            educationsPromise={educationsPromise}
            experiencesPromise={experiencesPromise}
            form={{ ...form, setValues }}
            isClearDisabled={!hasFiltersChanged}
            onClear={() => {
              debouncedOnChange.cancel();
              onClear();
            }}
            skills={skills}
          />
        </Loading>
      </Drawer.Content>
    </Drawer>
  );
};
