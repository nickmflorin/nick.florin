import dynamic from "next/dynamic";

import { getSkills } from "~/actions/fetches/skills";
import { type ContextTableComponent } from "~/components/tables/types";
import { Loading } from "~/components/views/Loading";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading loading={true} />,
}) as ContextTableComponent;

interface SkillsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const SkillsAdminTable = async ({ page, filters }: SkillsAdminTableProps) => {
  const skills = await getSkills({
    page,
    visibility: "admin",
    filters,
    includes: { projects: true, educations: true, experiences: true },
  });
  return <ContextTable data={skills} />;
};
