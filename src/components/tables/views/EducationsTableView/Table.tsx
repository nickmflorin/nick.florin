import dynamic from "next/dynamic";

import { getEducations } from "~/actions/fetches/educations";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface EducationsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const EducationsAdminTable = async ({ page, filters }: EducationsAdminTableProps) => {
  const educations = await getEducations({
    page,
    filters,
    visibility: "admin",
    includes: ["details"],
  });
  return <ContextTable data={educations} />;
};
