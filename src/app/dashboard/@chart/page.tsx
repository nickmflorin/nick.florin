import qs from "qs";

import type { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { parseQuery, isRecordType } from "~/lib/urls";
import { SkillsFiltersSchema, ShowTopSkillsSchema } from "~/api/schemas";
import { SkillsBarChartView } from "~/components/charts/SkillsBarChartView";

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

  const { showTopSkills = "all", ...rest } = filters;

  return (
    <SkillsBarChartView
      filters={rest}
      limit={showTopSkills === "all" ? undefined : showTopSkills}
      maxHeight={400}
      height={400}
    />
  );
}
