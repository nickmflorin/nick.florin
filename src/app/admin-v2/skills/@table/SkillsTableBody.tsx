import dynamic from "next/dynamic";

import { type SkillsControls, type SkillsFilters } from "~/actions-v2";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { Loading } from "~/components/loading/Loading";

const ClientSkillsTableBody = dynamic(
  () => import("~/features/skills/components/tables-v2/SkillsTableBody"),
  { loading: () => <Loading isLoading component="tbody" /> },
);

export interface SkillsTableBodyProps {
  readonly filters: SkillsFilters;
  readonly page: number;
  readonly ordering: SkillsControls["ordering"];
}

export const SkillsTableBody = async ({
  filters,
  page,
  ordering,
}: SkillsTableBodyProps): Promise<JSX.Element> => {
  const fetcher = fetchSkills(["projects", "educations", "experiences", "repositories"]);
  const { data: skills } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "public",
    },
    { strict: true },
  );
  return <ClientSkillsTableBody data={skills} />;
};
