import dynamic from "next/dynamic";

import clsx from "clsx";

import { getSkills } from "~/actions/fetches/skills";
import type { SkillsFilters } from "~/api/schemas";
import { Loading } from "~/components/feedback/Loading";
import type { ComponentProps } from "~/components/types";

import { SkillsBarChartLegend } from "./SkillsBarChartLegend";

export interface SkillsBarChartViewProps extends ComponentProps {
  readonly filters: Omit<SkillsFilters, "search" | "includeInTopSkills">;
  readonly limit?: number;
}

const Chart = dynamic(() => import("./ClientSkillsBarChart"), {
  loading: () => <Loading isLoading={true} />,
});

export const SkillsBarChartView = async ({
  filters,
  limit,
  ...props
}: SkillsBarChartViewProps): Promise<JSX.Element> => {
  const skills = await getSkills({
    includes: [],
    visibility: "public",
    filters: { ...filters, includeInTopSkills: true },
    limit,
  });

  return (
    <div
      {...props}
      className={clsx(
        "flex flex-col gap-[8px] h-full w-full max-h-full max-w-full",
        "[&_g]:cursor-pointer",
        props.className,
      )}
    >
      <div className={clsx("relative", "max-md:h-[340px]", "md:max-lg:h-[500px]", "lg:h-[600px]")}>
        <Chart skills={skills} />
      </div>
      <SkillsBarChartLegend skills={skills} />
    </div>
  );
};

export default SkillsBarChartView;
