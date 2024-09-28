import { Suspense } from "react";

import { ProjectsFiltersObj } from "~/actions-v2";

import { LoadingText } from "~/components/loading/LoadingText";

import { ProjectsTitle } from "./ProjectsTitle";

export interface ProjectsTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ProjectsTitlePage({ searchParams }: ProjectsTitlePageProps) {
  const filters = ProjectsFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <ProjectsTitle filters={filters} />
    </Suspense>
  );
}
