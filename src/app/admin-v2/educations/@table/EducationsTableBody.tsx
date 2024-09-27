import dynamic from "next/dynamic";

import { type EducationsControls, type EducationsFilters } from "~/actions-v2";
import { fetchEducations } from "~/actions-v2/educations/fetch-educations";

import { Loading } from "~/components/loading/Loading";
import { EducationsTableControlBarPlaceholder } from "~/features/educations/components/tables-v2/EducationsTableControlBarPlaceholder";

const ClientEducationsTableBody = dynamic(
  () =>
    import("~/features/educations/components/tables-v2/EducationsTableBody").then(
      mod => mod.EducationsTableBody,
    ),
  {
    loading: () => (
      <>
        <EducationsTableControlBarPlaceholder />
        <Loading isLoading component="tbody" />
      </>
    ),
  },
);

const getEducations = async ({
  page,
  filters,
  ordering,
}: {
  readonly filters: EducationsFilters;
  readonly page: number;
  readonly ordering: EducationsControls["ordering"];
}) => {
  const fetcher = fetchEducations(["skills", "details"]);
  const { data: educations } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return educations;
};

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
  const educations = await getEducations({ page, filters, ordering });
  return <ClientEducationsTableBody data={educations} />;
};
