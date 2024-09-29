import { type SkillsFilters } from "~/actions";
import { fetchSkillsCount } from "~/actions/skills/fetch-skills";

export interface SkillsTitleProps {
  readonly filters: SkillsFilters;
}

export const SkillsTitle = async ({ filters }: SkillsTitleProps) => {
  const {
    data: { count },
  } = await fetchSkillsCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
