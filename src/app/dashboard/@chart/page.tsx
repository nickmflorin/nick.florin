import { Suspense } from "react";

import qs from "qs";

import type { z } from "zod";

import { partiallyParseObjectWithSchema } from "~/lib/schemas";
import { parseQuery, isRecordType } from "~/lib/urls";
import { SkillsFiltersSchema, ShowTopSkillsSchema } from "~/api/schemas";
import { SkillsBarChartView } from "~/components/charts/SkillsBarChartView";
import { Loading } from "~/components/feedback/Loading";
import { SkillsFilterDropdownMenu } from "~/components/menus/SkillsFilterDropdownMenu";
import { Module } from "~/components/modules/generic";

interface ChartPageProps {
  readonly searchParams: Record<string, unknown>;
}

const FiltersSchema = SkillsFiltersSchema.omit({ search: true, includeInTopSkills: true }).extend({
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

  const {
    showTopSkills = "all",
    experiences = [],
    educations = [],
    categories = [],
    programmingDomains = [],
    programmingLanguages = [],
  } = filters;

  return (
    <>
      <Module.Header
        className="!pr-[0px]"
        actions={[
          <Suspense key="0">
            <SkillsFilterDropdownMenu
              placement="bottom-start"
              filters={{
                experiences,
                educations,
                categories,
                programmingDomains,
                programmingLanguages,
                showTopSkills,
              }}
            />
          </Suspense>,
        ]}
      >
        Skills Overview
      </Module.Header>
      <Module.Content className="xl:overflow-y-auto xl:pr-[16px]">
        <Suspense fallback={<Loading isLoading={true} />} key={qs.stringify(filters)}>
          <SkillsBarChartView
            filters={{
              experiences,
              educations,
              categories,
              programmingDomains,
              programmingLanguages,
            }}
            limit={showTopSkills === "all" ? undefined : showTopSkills}
          />
        </Suspense>
      </Module.Content>
    </>
  );
}
