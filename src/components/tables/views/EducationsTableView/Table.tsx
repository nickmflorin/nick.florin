import dynamic from "next/dynamic";

import { getEducations, type GetEducationsFilters } from "~/actions/fetches/educations";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface EducationsAdminTableProps {
  readonly page: number;
  readonly filters: GetEducationsFilters;
}

export const EducationsAdminTable = async ({ page, filters }: EducationsAdminTableProps) => {
  const educations = await getEducations({
    page,
    filters,
    visibility: "admin",
    includes: ["details", "skills"],
  });
  return <ContextTable data={educations} />;
};
