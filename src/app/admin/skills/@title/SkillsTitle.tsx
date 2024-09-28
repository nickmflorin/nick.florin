import { type SkillsFilters } from "~/actions-v2";
import { fetchSkillsCount } from "~/actions-v2/skills/fetch-skills";

export interface SkillsTitleProps {
  readonly filters: SkillsFilters;
}

export const SkillsTitle = async ({ filters }: SkillsTitleProps) => {
  const {
    data: { count },
  } = await fetchSkillsCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
