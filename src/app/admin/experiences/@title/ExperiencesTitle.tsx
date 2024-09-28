import { type ExperiencesFilters } from "~/actions-v2";
import { fetchExperiencesCount } from "~/actions-v2/experiences/fetch-experiences";

export interface ExperiencesTitleProps {
  readonly filters: ExperiencesFilters;
}

export const ExperiencesTitle = async ({ filters }: ExperiencesTitleProps) => {
  const {
    data: { count },
  } = await fetchExperiencesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
