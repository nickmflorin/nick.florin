import dynamic from "next/dynamic";

import { type EducationsControls, type EducationsFilters } from "~/actions-v2";
import { fetchEducations } from "~/actions-v2/educations/fetch-educations";

import { Loading } from "~/components/loading/Loading";

const ClientEducationsTableBody = dynamic(
  () =>
    import("~/features/educations/components/tables-v2/EducationsTableBody").then(
      mod => mod.EducationsTableBody,
    ),
  { loading: () => <Loading isLoading component="tbody" /> },
);

export interface EducationsTableBodyProps {
  readonly filters: EducationsFilters;
  readonly page: number;
  readonly ordering: EducationsControls["ordering"];
}

export const EducationsTableBody = async ({
  filters,
  page,
  ordering,
}: EducationsTableBodyProps): Promise<JSX.Element> => {
  const fetcher = fetchEducations(["skills", "details"]);
  const { data: skills } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return <ClientEducationsTableBody data={skills} />;
};
