'use client';
/* This component uses hooks, so it was already only ever rendered inside a client boundary.  The
   directive is now required explicitly, because Next does not allow 'ssr: false' with next/dynamic
   outside of a Client Component. */
import dynamic from 'next/dynamic';
import { type JSX, useState } from 'react';

import { type ApiSkill } from '~/database/model';

import { ChartFilterButton } from '~/components/buttons/ChartFilterButton';
import { DrawerIds } from '~/components/drawers';
import { PortalDrawerWrapper } from '~/components/drawers/PortalDrawerWrapper';
import { Tooltip } from '~/components/floating/Tooltip';
import { Loading } from '~/components/loading/Loading';
import { type SkillsChartFilterFormValues } from '~/features/skills/components/forms/SkillsChartFilterForm';
import { useScreenSizes } from '~/hooks';

const SkillsFilterPopover = dynamic(
  () => import('./SkillsFilterPopover').then(mod => mod.SkillsFilterPopover),
  { ssr: false },
);

const SkillsFilterDrawer = dynamic(
  () => import('./drawers/SkillsFilterDrawer').then(mod => mod.SkillsFilterDrawer),
  { loading: () => <Loading isLoading />, ssr: false },
);

export interface SkillsFilterDropdownMenuProps {
  readonly filters: SkillsChartFilterFormValues;
  readonly hasFiltersChanged: boolean;
  readonly isLoading: boolean;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
  readonly onClear: () => void;
  readonly skills: ApiSkill<[]>[];
}

export const SkillsFilterDropdownMenu = ({
  filters,
  hasFiltersChanged,
  isLoading,
  onChange,
  onClear,
  skills,
}: SkillsFilterDropdownMenuProps): JSX.Element => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const { isLessThan } = useScreenSizes();

  const shouldUseMobileFiltersDrawer = isLessThan('md');

  if (shouldUseMobileFiltersDrawer) {
    return (
      <>
        <Tooltip content='Filters' isInPortal offset={{ mainAxis: 4 }}>
          {({ params, ref }) => (
            <ChartFilterButton
              {...params}
              onClick={() => setDrawerIsOpen(true)}
              ref={ref}
              size={isLessThan('md') ? 'xsmall' : 'small'}
            />
          )}
        </Tooltip>
        {drawerIsOpen && (
          <PortalDrawerWrapper
            drawerId={DrawerIds.SKILLS_FILTERS}
            onClose={() => setDrawerIsOpen(false)}
          >
            <SkillsFilterDrawer
              filters={filters}
              hasFiltersChanged={hasFiltersChanged}
              isLoading={isLoading}
              onChange={onChange}
              onClear={onClear}
              onClose={() => setDrawerIsOpen(false)}
              skills={skills}
            />
          </PortalDrawerWrapper>
        )}
      </>
    );
  }
  return (
    <SkillsFilterPopover
      filters={filters}
      hasFiltersChanged={hasFiltersChanged}
      onChange={onChange}
      onClear={onClear}
      skills={skills}
    />
  );
};
