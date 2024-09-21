import { SkillsFiltersObj } from "~/actions-v2";
import { fetchSkillsCount } from "~/actions-v2/skills/fetch-skills";

export interface SkillsTitlePageProps {
  readonly searchParams: Record<string, string>;
}
export default async function SkillsTitlePage({ searchParams }: SkillsTitlePageProps) {
  const filters = SkillsFiltersObj.parse(searchParams);
  const {
    data: { count },
  } = await fetchSkillsCount({ visibility: "public", filters }, { strict: true });
  return <>{count}</>;
}
