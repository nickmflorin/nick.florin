import { type ExperiencesFilters } from "~/actions";
import { fetchExperiencesCount } from "~/actions/experiences/fetch-experiences";

export interface ExperiencesTitleProps {
  readonly filters: ExperiencesFilters;
}

export const ExperiencesTitle = async ({ filters }: ExperiencesTitleProps) => {
  const {
    data: { count },
  } = await fetchExperiencesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
