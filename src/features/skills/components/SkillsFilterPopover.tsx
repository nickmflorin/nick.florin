import { type JSX, useEffect } from 'react';

import { flip } from '@floating-ui/react';

import { type ApiSkill } from '~/database/model';

import {
  ChartFilterButton,
  type ChartFilterButtonProps,
} from '~/components/buttons/ChartFilterButton';
import { Popover } from '~/components/floating/Popover';
import { PopoverContent } from '~/components/floating/PopoverContent';
import { Tooltip } from '~/components/floating/Tooltip';
import { mergeFloatingEventHandlers } from '~/components/floating/util';
import { useForm } from '~/components/forms-v2/hooks/use-form';
import { type EducationSelectModel } from '~/features/educations/components/input/EducationSelect';
import { type ExperienceSelectModel } from '~/features/experiences/components/input/ExperienceSelect';
import {
  SkillsChartFilterDebounceDelay,
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from '~/features/skills/components/forms/SkillsChartFilterForm';
import { useDebounceCallback } from '~/hooks';

export interface SkillsFilterPopoverProps {
  readonly buttonProps?: Omit<ChartFilterButtonProps, 'isDisabled'>;
  readonly educationsPromise: Promise<EducationSelectModel[] | null>;
  readonly experiencesPromise: Promise<ExperienceSelectModel[] | null>;
  readonly filters: SkillsChartFilterFormValues;
  readonly hasFiltersChanged: boolean;
  readonly isDisabled?: boolean;
  /**
   * Whether the popover should be open as soon as it mounts.
   *
   * Used when the component is mounted lazily in response to the trigger button already having
   * been clicked, so the popover opens without requiring a second click.
   */
  readonly isInitiallyOpen?: boolean;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
  readonly onClear: () => void;
  readonly skills: ApiSkill<[]>[];
}

export const SkillsFilterPopover = ({
  buttonProps,
  educationsPromise,
  experiencesPromise,
  filters,
  hasFiltersChanged,
  isDisabled = false,
  isInitiallyOpen = false,
  onChange,
  onClear,
  skills,
}: SkillsFilterPopoverProps): JSX.Element => {
  /* Form changes reach the chart only after a pause in activity, so a burst of select toggles
     produces one refetch; closing the popover flushes whatever is pending. */
  const debouncedOnChange = useDebounceCallback(onChange, SkillsChartFilterDebounceDelay);

  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    defaultValues: { showTopSkills: 'all' },
    onChange: ({ values }) => {
      debouncedOnChange(values);
    },
    schema: SkillsChartFilterFormSchema,
  });

  /* An externally-driven filters change (the module header's Clear button, or a change flushed by
     the drawer) supersedes anything pending here, so the pending call is cancelled before the form
     is synced - otherwise its stale values would apply on top of the external update. */
  useEffect(() => {
    debouncedOnChange.cancel();
    setValues(filters);
  }, [filters, setValues, debouncedOnChange]);

  return (
    <Popover
      autoUpdate
      content={
        <PopoverContent className='p-[20px] rounded-md overflow-y-auto'>
          <SkillsChartFilterForm
            educationsPromise={educationsPromise}
            experiencesPromise={experiencesPromise}
            form={{ ...form, setValues }}
            isClearDisabled={!hasFiltersChanged}
            isScrollable={false}
            onClear={() => {
              debouncedOnChange.cancel();
              onClear();
            }}
            skills={skills}
          />
        </PopoverContent>
      }
      hasArrow={false}
      initiallyIsOpen={isInitiallyOpen}
      isDisabled={isDisabled}
      isInPortal
      middleware={[flip({})]}
      offset={{ mainAxis: 4 }}
      onClose={() => debouncedOnChange.flush()}
      placement='bottom-end'
      triggers={['click']}
      width={400}
    >
      {({ isOpen, params, ref }) => (
        <Tooltip content='Filters' isDisabled={isOpen} isInPortal offset={{ mainAxis: 4 }}>
          {({ params: _params, ref: _ref }) => (
            <ChartFilterButton
              {...mergeFloatingEventHandlers(params, _params)}
              size={{ base: 'xsmall', md: 'small' }}
              {...buttonProps}
              isDisabled={isDisabled}
              ref={instance => {
                _ref?.(instance);
                ref(instance);
              }}
            />
          )}
        </Tooltip>
      )}
    </Popover>
  );
};
