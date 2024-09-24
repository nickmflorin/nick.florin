import { ExperiencesFiltersObj } from "~/actions-v2";
import { fetchExperiencesCount } from "~/actions-v2/experiences/fetch-experiences";

export interface ExperiencesTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ExperiencesTitlePage({ searchParams }: ExperiencesTitlePageProps) {
  const filters = ExperiencesFiltersObj.parse(searchParams);
  const {
    data: { count },
  } = await fetchExperiencesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
}
