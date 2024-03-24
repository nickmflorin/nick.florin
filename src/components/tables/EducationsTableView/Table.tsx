import dynamic from "next/dynamic";

import { getAdminEducations } from "~/actions/fetches/get-educations";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("../ContextTable"), {
  loading: () => <Loading loading={true} />,
});

interface EducationsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const EducationsAdminTable = async ({ page, filters }: EducationsAdminTableProps) => {
  const educations = await getAdminEducations({ page, filters });
  return <ContextTable data={educations} />;
};
