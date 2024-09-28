import dynamic from "next/dynamic";

import { type ExperiencesControls, type ExperiencesFilters } from "~/actions-v2";
import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";

import { Loading } from "~/components/loading/Loading";
import { ExperiencesTableControlBarPlaceholder } from "~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder";

const ClientExperiencesTableBody = dynamic(
  () =>
    import("~/features/experiences/components/tables/ExperiencesTableBody").then(
      mod => mod.ExperiencesTableBody,
    ),
  {
    loading: () => (
      <>
        <ExperiencesTableControlBarPlaceholder />
        <Loading isLoading component="tbody" />
      </>
    ),
  },
);

const getExperiences = async ({
  page,
  filters,
  ordering,
}: {
  readonly filters: ExperiencesFilters;
  readonly page: number;
  readonly ordering: ExperiencesControls["ordering"];
}) => {
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
  return experiences;
};

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
  const experiences = await getExperiences({ page, filters, ordering });
  return <ClientExperiencesTableBody data={experiences} />;
};
