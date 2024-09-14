import dynamic from "next/dynamic";
import { memo } from "react";

import { getExperiences, type GetExperiencesFilters } from "~/actions/fetches/experiences";

import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

const ContextTable = dynamic(() => import("~/components/tables/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface ExperiencesAdminTableProps {
  readonly page: number;
  readonly filters: Omit<GetExperiencesFilters, "highlighted">;
}

export const ExperiencesAdminTable = memo(async ({ page, filters }: ExperiencesAdminTableProps) => {
  const experiences = await getExperiences({
    page,
    filters,
    visibility: "admin",
    includes: ["details", "skills"],
  });
  return <ContextTable data={experiences} />;
});
