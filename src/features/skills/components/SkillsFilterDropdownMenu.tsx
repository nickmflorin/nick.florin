import dynamic from "next/dynamic";

import { ChartFilterButton } from "~/components/buttons/ChartFilterButton";
import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { type SkillsChartFilterFormValues } from "~/features/skills/components/forms/SkillsChartFilterForm";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const SkillsFilterPopover = dynamic(
  () => import("./SkillsFilterPopover").then(mod => mod.SkillsFilterPopover),
  { ssr: false },
);

export interface SkillsFilterDropdownMenuProps {
  readonly filters: SkillsChartFilterFormValues;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterDropdownMenu = ({
  filters,
  onChange,
}: SkillsFilterDropdownMenuProps): JSX.Element => {
  const { open } = useDrawers();
  const { isLessThan } = useScreenSizes();

  /* We do not want to show the chart filters on mobile devices until we figure out how to more
     cleanly integrate them into the mobile experience with a drawer instead of a popover. */
  if (isLessThan("md")) {
    return (
      <ChartFilterButton
        size={isLessThan("md") ? "xsmall" : "small"}
        onClick={() => open(DrawerIds.SKILLS_FILTERS, { filters, onChange })}
      />
    );
  }
  return <SkillsFilterPopover filters={filters} onChange={onChange} />;
};

export default SkillsFilterDropdownMenu;
