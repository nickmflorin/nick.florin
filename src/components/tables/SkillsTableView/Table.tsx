import dynamic from "next/dynamic";

import { getSkills } from "~/actions/fetches/get-skills";
import { Loading } from "~/components/views/Loading";

import { type ContextTableComponent } from "../types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("../ContextTable"), {
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
  });
  return <ContextTable data={skills} />;
};
