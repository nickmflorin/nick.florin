import dynamic from "next/dynamic";

import { getProjects } from "~/actions/fetches/projects";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface ProjectsAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const ProjectsAdminTable = async ({ page, filters }: ProjectsAdminTableProps) => {
  const projects = await getProjects({
    page,
    filters,
    /* We will eventually need to include skills once we create a way to manage skills via a select
       or popover, both in general and in the table. */
    includes: [],
    visibility: "admin",
  });
  return <ContextTable data={projects} />;
};
