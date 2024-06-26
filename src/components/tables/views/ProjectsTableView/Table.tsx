import dynamic from "next/dynamic";
import { memo } from "react";

import { getProjects, type GetProjectsFilters } from "~/actions/fetches/projects";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface ProjectsAdminTableProps {
  readonly page: number;
  readonly filters: Omit<GetProjectsFilters, "highlighted">;
}

export const ProjectsAdminTable = memo(async ({ page, filters }: ProjectsAdminTableProps) => {
  const projects = await getProjects({
    page,
    filters,
    /* We will eventually need to include skills once we create a way to manage skills via a select
       or popover, both in general and in the table. */
    includes: ["skills"],
    visibility: "admin",
  });
  return <ContextTable data={projects} />;
});
