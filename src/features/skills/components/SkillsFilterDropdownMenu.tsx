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
import { mergeFloatingEventHandlers } from '~/components/floating/util';
import { Loading } from '~/components/loading/Loading';
import { preloadSkillsChartFilterData } from '~/features/skills/components/forms/preload-skills-chart-filter-data';
import { type SkillsChartFilterFormValues } from '~/features/skills/components/forms/SkillsChartFilterForm';
import { useScreenSizes } from '~/hooks';

const loadSkillsFilterPopover = () => import('./SkillsFilterPopover');

const SkillsFilterPopover = dynamic(
  () => loadSkillsFilterPopover().then(mod => mod.SkillsFilterPopover),
  {
    /* While the chunk resolves after the opening click, keep a disabled copy of the trigger in
       place so the button does not flash out of the layout. */
    loading: () => <ChartFilterButton isDisabled size='small' />,
    ssr: false,
  },
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
  const [popoverIsMounted, setPopoverIsMounted] = useState(false);
  const { isLessThan } = useScreenSizes();

  /* Which surface the filters open in is decided when they are opened, not while rendering. Both
     surfaces present the same trigger and the drawer mounts nothing until it is opened, so the
     choice never reaches the server-rendered output - and by the time it is made, the measured
     viewport has replaced whatever the screen-size hook started from. */
  const shouldUseMobileFiltersDrawer = () => isLessThan('md');

  /* Fired on any signal of intent to open the filters. The select data is wanted either way; the
     popover chunk is only worth fetching where the popover is what would open. */
  const preloadFilterControls = () => {
    preloadSkillsChartFilterData();
    if (!shouldUseMobileFiltersDrawer()) {
      void loadSkillsFilterPopover();
    }
  };

  /* Mounting the popover with 'isInitiallyOpen' opens it immediately, so the click that mounted it
     does not need to be repeated. */
  if (popoverIsMounted) {
    return (
      <SkillsFilterPopover
        filters={filters}
        hasFiltersChanged={hasFiltersChanged}
        isInitiallyOpen
        onChange={onChange}
        onClear={onClear}
        skills={skills}
      />
    );
  }
  return (
    <>
      <Tooltip content='Filters' isInPortal offset={{ mainAxis: 4 }}>
        {({ params, ref }) => (
          <ChartFilterButton
            {...mergeFloatingEventHandlers(params, {
              onFocus: () => preloadFilterControls(),
              onMouseEnter: () => preloadFilterControls(),
            })}
            onClick={() => {
              preloadFilterControls();
              if (shouldUseMobileFiltersDrawer()) {
                setDrawerIsOpen(true);
              } else {
                setPopoverIsMounted(true);
              }
            }}
            ref={ref}
            size={{ base: 'xsmall', md: 'small' }}
          />
        )}
      </Tooltip>
      <PortalDrawerWrapper
        drawerId={DrawerIds.SKILLS_FILTERS}
        onClose={() => setDrawerIsOpen(false)}
      >
        {drawerIsOpen ? (
          <SkillsFilterDrawer
            filters={filters}
            hasFiltersChanged={hasFiltersChanged}
            isLoading={isLoading}
            onChange={onChange}
            onClear={onClear}
            onClose={() => setDrawerIsOpen(false)}
            skills={skills}
          />
        ) : null}
      </PortalDrawerWrapper>
    </>
  );
};
