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

/* Fired on any signal of intent to open the filters (hover, focus, click): kicks both the popover
   chunk and the select-data requests so they resolve in parallel, ahead of the form mounting. */
const preloadFilterControls = () => {
  void loadSkillsFilterPopover();
  preloadSkillsChartFilterData();
};

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

  const shouldUseMobileFiltersDrawer = isLessThan('md');

  if (shouldUseMobileFiltersDrawer) {
    return (
      <>
        <Tooltip content='Filters' isInPortal offset={{ mainAxis: 4 }}>
          {({ params, ref }) => (
            <ChartFilterButton
              {...params}
              onClick={() => {
                preloadSkillsChartFilterData();
                setDrawerIsOpen(true);
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
  }
  /* The trigger button renders eagerly - and server-side - while the popover chunk and the
     select data are only fetched on intent: preloaded when the button is hovered or focused, and
     mounted on the first click. Mounting with 'isInitiallyOpen' opens the popover immediately, so
     the click that mounted it does not need to be repeated. */
  if (!popoverIsMounted) {
    return (
      <Tooltip content='Filters' isInPortal offset={{ mainAxis: 4 }}>
        {({ params, ref }) => (
          <ChartFilterButton
            {...mergeFloatingEventHandlers(params, {
              onFocus: () => preloadFilterControls(),
              onMouseEnter: () => preloadFilterControls(),
            })}
            onClick={() => {
              preloadFilterControls();
              setPopoverIsMounted(true);
            }}
            ref={ref}
            size={{ base: 'xsmall', md: 'small' }}
          />
        )}
      </Tooltip>
    );
  }
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
};
