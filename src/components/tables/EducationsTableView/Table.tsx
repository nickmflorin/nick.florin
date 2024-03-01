import dynamic from "next/dynamic";

import { getAdminExperiences } from "~/actions/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ClientTable = dynamic(() => import("./ClientTable"), {
  loading: () => <Loading loading={true} />,
});

interface ExperiencesAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const ExperiencesAdminTable = async ({ page, filters }: ExperiencesAdminTableProps) => {
  const experiences = await getAdminExperiences({ page, filters });
  return <ClientTable experiences={experiences} />;
};
