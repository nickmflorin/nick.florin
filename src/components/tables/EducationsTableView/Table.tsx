import dynamic from "next/dynamic";

import { getAdminEducations } from "~/actions/fetches/get-educations";
import { getSchools } from "~/actions/fetches/get-schools";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ClientTable = dynamic(() => import("./ClientTable"), {
  loading: () => <Loading loading={true} />,
});

interface EducationsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const EducationsAdminTable = async ({ page, filters }: EducationsAdminTableProps) => {
  const educations = await getAdminEducations({ page, filters });
  const schools = await getSchools();
  return <ClientTable educations={educations} schools={schools} />;
};
