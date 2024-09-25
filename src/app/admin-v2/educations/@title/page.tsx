import { EducationsFiltersObj } from "~/actions-v2";
import { fetchEducationsCount } from "~/actions-v2/educations/fetch-educations";

export interface EducationsTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function EducationsTitlePage({ searchParams }: EducationsTitlePageProps) {
  const filters = EducationsFiltersObj.parse(searchParams);
  const {
    data: { count },
  } = await fetchEducationsCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
}
