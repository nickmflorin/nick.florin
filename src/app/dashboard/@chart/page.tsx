import { Suspense } from "react";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { decodeQueryParams, encodeQueryParams } from "~/lib/urls";
import { SkillsFiltersSchema, ShowTopSkillsSchema } from "~/api/schemas";
import { SkillsBarChartView } from "~/components/charts/SkillsBarChartView";
import { Loading } from "~/components/feedback/Loading";
import { SkillsFilterDropdownMenu } from "~/components/menus/SkillsFilterDropdownMenu";
import { Module } from "~/components/modules/generic";

interface ChartPageProps {
  readonly searchParams: Record<string, string>;
}

const FiltersSchema = SkillsFiltersSchema.omit({ search: true, includeInTopSkills: true }).extend({
  showTopSkills: ShowTopSkillsSchema,
});

export default async function ChartPage({ searchParams }: ChartPageProps) {
  const params = decodeQueryParams(encodeQueryParams(searchParams.filters));

  const { showTopSkills, ...filters } = partiallyParseObjectWithSchema(params, FiltersSchema, {
    defaults: {
      showTopSkills: "all",
      experiences: [],
      educations: [],
      categories: [],
      programmingDomains: [],
      programmingLanguages: [],
    },
  });

  return (
    <>
      <Module.Header
        className="!pr-[0px]"
        actions={[
          <Suspense key="0">
            <SkillsFilterDropdownMenu filters={{ ...filters, showTopSkills }} />
          </Suspense>,
        ]}
      >
        Skills Overview
      </Module.Header>
      <Module.Content className="xl:overflow-y-auto xl:pr-[16px]">
        <Suspense fallback={<Loading isLoading={true} />} key={encodeQueryParams(filters)}>
          <SkillsBarChartView
            filters={filters}
            limit={showTopSkills === "all" ? undefined : showTopSkills}
          />
        </Suspense>
      </Module.Content>
    </>
  );
}
