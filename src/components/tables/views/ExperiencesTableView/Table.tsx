import dynamic from "next/dynamic";

import { getExperiences } from "~/actions/fetches/experiences";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface ExperiencesAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const ExperiencesAdminTable = async ({ page, filters }: ExperiencesAdminTableProps) => {
  const experiences = await getExperiences({
    page,
    filters,
    visibility: "admin",
    includes: ["details"],
  });
  return <ContextTable data={experiences} />;
};
