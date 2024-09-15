import { Suspense } from "react";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { decodeQueryParams } from "~/lib/urls";

import { SkillsFiltersSchema, ShowTopSkillsSchema } from "~/api/schemas";

import { Module } from "~/components/modules/generic";
import { SkillsBarChartView } from "~/features/skills/components/charts/SkillsBarChartView";
import { SkillsFilterDropdownMenu } from "~/features/skills/components/SkillsFilterDropdownMenu";

interface ChartPageProps {
  readonly searchParams: Record<string, string>;
}

const FiltersSchema = SkillsFiltersSchema.omit({ search: true, includeInTopSkills: true }).extend({
  showTopSkills: ShowTopSkillsSchema,
});

export default async function ChartPage({ searchParams }: ChartPageProps) {
  const params = decodeQueryParams(searchParams);

  const { showTopSkills, ...filters } = partiallyParseObjectWithSchema(
    params.filters,
    FiltersSchema,
    {
      defaults: {
        showTopSkills: "all",
        experiences: [],
        educations: [],
        categories: [],
        programmingDomains: [],
        programmingLanguages: [],
      },
    },
  );

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
        <SkillsBarChartView
          filters={filters}
          limit={showTopSkills === "all" ? undefined : showTopSkills}
        />
      </Module.Content>
    </>
  );
}
