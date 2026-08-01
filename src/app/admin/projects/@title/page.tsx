import { Suspense } from "react";

import { ProjectsFiltersObj } from "~/actions";

import { LoadingText } from "~/components/loading/LoadingText";

import { ProjectsTitle } from "./ProjectsTitle";

export interface ProjectsTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

export default async function ProjectsTitlePage(props: ProjectsTitlePageProps) {
  const searchParams = await props.searchParams;
  const filters = ProjectsFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <ProjectsTitle filters={filters} />
    </Suspense>
  );
}
