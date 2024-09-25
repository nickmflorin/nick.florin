import dynamic from "next/dynamic";

import { type ExperiencesControls, type ExperiencesFilters } from "~/actions-v2";
import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";

import { Loading } from "~/components/loading/Loading";

const ClientExperiencesTableBody = dynamic(
  () =>
    import("~/features/experiences/components/tables-v2/ExperiencesTableBody").then(
      mod => mod.ExperiencesTableBody,
    ),
  { loading: () => <Loading isLoading component="tbody" /> },
);

export interface ExperiencesTableBodyProps {
  readonly filters: ExperiencesFilters;
  readonly page: number;
  readonly ordering: ExperiencesControls["ordering"];
}

export const ExperiencesTableBody = async ({
  filters,
  page,
  ordering,
}: ExperiencesTableBodyProps): Promise<JSX.Element> => {
  const fetcher = fetchExperiences(["skills", "details"]);
  const { data: experiences } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return <ClientExperiencesTableBody data={experiences} />;
};
