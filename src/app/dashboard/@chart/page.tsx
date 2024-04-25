import dynamic from "next/dynamic";
import { Suspense } from "react";

import qs from "qs";

import type { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { parseQuery, isRecordType } from "~/lib/urls";
import { SkillsFiltersSchema, ShowTopSkillsSchema } from "~/api/schemas";
import { SkillsBarChartView } from "~/components/charts/skills/server/SkillsBarChartView";
import { Loading } from "~/components/feedback/Loading";

const SkillsFilterDropdownMenu = dynamic(
  () => import("~/components/menus/SkillsFilterDropdownMenu"),
);

interface ChartPageProps {
  readonly searchParams: Record<string, unknown>;
}

const FiltersSchema = SkillsFiltersSchema.extend({
  showTopSkills: ShowTopSkillsSchema.optional(),
});

export default async function ChartPage({ searchParams }: ChartPageProps) {
  const params = parseQuery(qs.stringify(searchParams));

  let filters: z.infer<typeof FiltersSchema> = {};
  if (params && isRecordType(params) && isRecordType(params.filters)) {
    filters = partiallyParseObjectWithSchema(params.filters, FiltersSchema, {
      logWhenInvalid: true,
    });
  }

  const { showTopSkills = 12, ...rest } = filters;

  return (
    <>
      <SkillsFilterDropdownMenu
        placement="bottom-start"
        // buttonProps={{ className: "absolute z-50 right-[24px] top-[8px]" }}
        useSearchParams
      />
      <Suspense key={qs.stringify(filters)} fallback={<Loading isLoading={true} />}>
        <SkillsBarChartView
          filters={rest}
          limit={showTopSkills === "all" ? undefined : showTopSkills}
          className="w-full h-[300px]"
        />
      </Suspense>
    </>
  );
}
