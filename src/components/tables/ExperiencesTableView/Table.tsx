import dynamic from "next/dynamic";

import { getExperiences } from "~/actions/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

import { type ContextTableComponent } from "../types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("../ContextTable"), {
  loading: () => <Loading loading={true} />,
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
    includes: { details: true },
  });
  return <ContextTable data={experiences} />;
};
