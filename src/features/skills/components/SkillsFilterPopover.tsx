import dynamic from 'next/dynamic';
import { type JSX, useEffect } from 'react';

import { flip } from '@floating-ui/react';

import { type ApiSkill } from '~/database/model';

import {
  ChartFilterButton,
  type ChartFilterButtonProps,
} from '~/components/buttons/ChartFilterButton';
import { PopoverContent } from '~/components/floating/PopoverContent';
import { Tooltip } from '~/components/floating/Tooltip';
import { mergeFloatingEventHandlers } from '~/components/floating/util';
import { useForm } from '~/components/forms-v2/hooks/use-form';
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from '~/features/skills/components/forms/SkillsChartFilterForm';
import { useScreenSizes } from '~/hooks/use-screen-sizes';

const Popover = dynamic(() => import('~/components/floating/Popover').then(mod => mod.Popover));

export interface SkillsFilterPopoverProps {
  readonly buttonProps?: Omit<ChartFilterButtonProps, 'isDisabled'>;
  readonly filters: SkillsChartFilterFormValues;
  readonly hasFiltersChanged: boolean;
  readonly isDisabled?: boolean;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
  readonly onClear: () => void;
  readonly skills: ApiSkill<[]>[];
}

export const SkillsFilterPopover = ({
  buttonProps,
  filters,
  hasFiltersChanged,
  isDisabled = false,
  onChange,
  onClear,
  skills,
}: SkillsFilterPopoverProps): JSX.Element => {
  const { isLessThan } = useScreenSizes();

  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    defaultValues: { showTopSkills: 'all' },
    onChange: ({ values }) => {
      onChange(values);
    },
    schema: SkillsChartFilterFormSchema,
  });

  useEffect(() => {
    setValues(filters);
  }, [filters, setValues]);

  return (
    <Popover
      autoUpdate
      content={
        <PopoverContent className='p-[20px] rounded-md overflow-y-auto'>
          <SkillsChartFilterForm
            form={{ ...form, setValues }}
            isClearDisabled={!hasFiltersChanged}
            isScrollable={false}
            onClear={onClear}
            skills={skills}
          />
        </PopoverContent>
      }
      hasArrow={false}
      isDisabled={isDisabled}
      isInPortal
      middleware={[flip({})]}
      offset={{ mainAxis: 4 }}
      placement='bottom-end'
      triggers={['click']}
      width={400}
    >
      {({ isOpen, params, ref }) => (
        <Tooltip content='Filters' isDisabled={isOpen} isInPortal offset={{ mainAxis: 4 }}>
          {({ params: _params, ref: _ref }) => (
            <ChartFilterButton
              {...mergeFloatingEventHandlers(params, _params)}
              size={isLessThan('md') ? 'xsmall' : 'small'}
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
