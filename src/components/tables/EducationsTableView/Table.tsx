import dynamic from "next/dynamic";

import { getEducations } from "~/actions/fetches/get-educations";
import { Loading } from "~/components/views/Loading";

import { type ContextTableComponent } from "../types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("../ContextTable"), {
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
    includes: { details: true },
  });
  return <ContextTable data={educations} />;
};
