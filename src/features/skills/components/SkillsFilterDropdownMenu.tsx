import dynamic from "next/dynamic";
import { useState } from "react";

import { type ApiSkill } from "~/database/model";

import { ChartFilterButton } from "~/components/buttons/ChartFilterButton";
import { DrawerIds } from "~/components/drawers";
// TODO: Dynamically load me, set loading indicator in filter button when loading.
import { PortalDrawerWrapper } from "~/components/drawers/PortalDrawerWrapper";
import { Tooltip } from "~/components/floating/Tooltip";
import { Loading } from "~/components/loading/Loading";
import { type SkillsChartFilterFormValues } from "~/features/skills/components/forms/SkillsChartFilterForm";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const SkillsFilterPopover = dynamic(
  () => import("./SkillsFilterPopover").then(mod => mod.SkillsFilterPopover),
  { ssr: false },
);

const SkillsFilterDrawer = dynamic(
  () => import("./drawers/SkillsFilterDrawer").then(mod => mod.SkillsFilterDrawer),
  { ssr: false, loading: () => <Loading isLoading /> },
);

export interface SkillsFilterDropdownMenuProps {
  readonly isLoading: boolean;
  readonly filters: SkillsChartFilterFormValues;
  readonly filtersHaveChanged: boolean;
  readonly skills: ApiSkill<[]>[];
  readonly onClear: () => void;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterDropdownMenu = ({
  filters,
  isLoading,
  filtersHaveChanged,
  skills,
  onClear,
  onChange,
}: SkillsFilterDropdownMenuProps): JSX.Element => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const { isLessThan } = useScreenSizes();

  /* We do not want to show the chart filters on mobile devices until we figure out how to more
     cleanly integrate them into the mobile experience with a drawer instead of a popover. */
  if (isLessThan("md")) {
    return (
      <>
        <Tooltip content="Filters" inPortal offset={{ mainAxis: 4 }}>
          {({ ref, params }) => (
            <ChartFilterButton
              {...params}
              ref={ref}
              size={isLessThan("md") ? "xsmall" : "small"}
              onClick={() => setDrawerIsOpen(true)}
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
              onChange={onChange}
              isLoading={isLoading}
              filtersHaveChanged={filtersHaveChanged}
              skills={skills}
              onClose={() => setDrawerIsOpen(false)}
              onClear={onClear}
            />
          </PortalDrawerWrapper>
        )}
      </>
    );
  }
  return (
    <SkillsFilterPopover
      filters={filters}
      skills={skills}
      filtersHaveChanged={filtersHaveChanged}
      onChange={onChange}
      onClear={() => onClear()}
    />
  );
};

export default SkillsFilterDropdownMenu;
