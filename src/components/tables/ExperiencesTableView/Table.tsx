import dynamic from "next/dynamic";

import { getExperiences } from "~/actions/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

const ClientTable = dynamic(() => import("./ClientTable"), {
  loading: () => <Loading loading={true} />,
});

interface ExperiencesAdminTableProps {
  readonly page: number;
}

export const ExperiencesAdminTable = async ({ page }: ExperiencesAdminTableProps) => {
  const experiences = await getExperiences({});
  return <ClientTable experiences={experiences} />;
};
