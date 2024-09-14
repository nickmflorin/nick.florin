import dynamic from "next/dynamic";
import { memo } from "react";

import { getSkills } from "~/actions/fetches/skills";

import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface SkillsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const SkillsAdminTable = memo(async ({ page, filters }: SkillsAdminTableProps) => {
  const skills = await getSkills({
    page,
    visibility: "admin",
    filters,
    includes: ["projects", "educations", "experiences", "repositories"],
  });
  return <ContextTable data={skills} />;
});
