import { ProjectsFiltersObj } from "~/actions-v2";
import { fetchProjectsCount } from "~/actions-v2/projects/fetch-projects";

export interface ProjectsTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ProjectsTitlePage({ searchParams }: ProjectsTitlePageProps) {
  const filters = ProjectsFiltersObj.parse(searchParams);
  const {
    data: { count },
  } = await fetchProjectsCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
}
