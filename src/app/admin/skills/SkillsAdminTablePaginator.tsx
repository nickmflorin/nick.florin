import { Paginator } from "~/components/pagination/Paginator";

import { PAGE_SIZE } from "./constants";
import { getSkillsCount } from "./getSkills";
import { type SkillsTableFilters } from "./types";

interface SkillsAdminTableProps {
  readonly filters: SkillsTableFilters;
}

export const SkillsAdminTablePaginator = async ({ filters }: SkillsAdminTableProps) => {
  const count = await getSkillsCount({ filters });
  return <Paginator count={count} pageSize={PAGE_SIZE} />;
};
