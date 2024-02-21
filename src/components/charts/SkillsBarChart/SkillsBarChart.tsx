import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo } from "react";

import type * as types from "../types";

import { generateChartColors } from "~/lib/charts";
import { TooltipContent } from "~/components/floating/TooltipContent";
import { Loading } from "~/components/views/Loading";

import { type SkillsBarChartDatum } from "./types";

const SkillsBarChartTooltip = dynamic(() => import("./SkillsBarChartTooltip"), {
  ssr: false,
  loading: () => <Loading loading={true} spinnerSize="sm" />,
});

const BarChart = dynamic(() => import("../BarChart"), {
  ssr: false,
  loading: () => <Loading loading={true} />,
}) as types.BarChart;

interface SkillsBarChartProps {
  readonly data: SkillsBarChartDatum[];
}

export const SkillsBarChart = ({ data }: SkillsBarChartProps): JSX.Element => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const colors = useMemo(() => generateChartColors(data.length), [data.length]);

  return (
    <BarChart
      data={data ?? []}
      indexBy="label"
      keys={["experience"]}
      enableLabel={false}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      colors={colors}
      colorBy="indexValue"
      axisBottom={null}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "# Years Experience",
        legendPosition: "middle",
        legendOffset: -40,
        truncateTickAt: 0,
      }}
      onClick={datum => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("skillId", datum.data.id);
        replace(`${pathname}?${params.toString()}`);
      }}
      tooltip={props => (
        <TooltipContent className="flex flex-col relative min-h-[60px] gap-[10px]">
          <SkillsBarChartTooltip {...props} />
        </TooltipContent>
      )}
    />
  );
};

export default SkillsBarChart;
