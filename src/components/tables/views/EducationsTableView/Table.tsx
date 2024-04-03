import dynamic from "next/dynamic";

import { getEducations } from "~/actions/fetches/educations";
import { type ContextTableComponent } from "~/components/tables/types";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading loading={true} />,
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
