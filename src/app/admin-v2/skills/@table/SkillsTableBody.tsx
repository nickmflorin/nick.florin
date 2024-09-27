import dynamic from "next/dynamic";

import { type SkillsControls, type SkillsFilters } from "~/actions-v2";
import { fetchSkills } from "~/actions-v2/skills/fetch-skills";

import { Loading } from "~/components/loading/Loading";
import { SkillsTableControlBarPlaceholder } from "~/features/skills/components/tables-v2/SkillsTableControlBarPlaceholder";

const ClientSkillsTableBody = dynamic(
  () =>
    import("~/features/skills/components/tables-v2/SkillsTableBody").then(
      mod => mod.SkillsTableBody,
    ),
  {
    loading: () => (
      <>
        <SkillsTableControlBarPlaceholder />
        <Loading isLoading component="tbody" />
      </>
    ),
  },
);

const getSkills = async ({
  page,
  filters,
  ordering,
}: {
  readonly filters: SkillsFilters;
  readonly page: number;
  readonly ordering: SkillsControls["ordering"];
}) => {
  const fetcher = fetchSkills(["projects", "educations", "experiences", "repositories"]);
  const { data: skills } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return skills;
};

export interface SkillsTableBodyProps {
  readonly filters: SkillsFilters;
  readonly page: number;
  readonly ordering: SkillsControls["ordering"];
}

export const SkillsTableBody = async ({ filters, page, ordering }: SkillsTableBodyProps) => {
  const skills = await getSkills({ page, filters, ordering });
  return <ClientSkillsTableBody data={skills} />;
};
