import { type EducationsFilters } from "~/actions-v2";
import { fetchEducationsCount } from "~/actions-v2/educations/fetch-educations";

export interface EducationsTitleProps {
  readonly filters: EducationsFilters;
}

export const EducationsTitle = async ({ filters }: EducationsTitleProps) => {
  const {
    data: { count },
  } = await fetchEducationsCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
