import dynamic from "next/dynamic";

import { getCourses } from "~/actions/fetches/courses";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

import { type Filters } from "./types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface CoursesAdminTableProps {
  readonly page: number;
  readonly filters: Filters;
}

export const CoursesAdminTable = async ({ page, filters }: CoursesAdminTableProps) => {
  const courses = await getCourses({
    page,
    filters,
    /* We will eventually need to include skills once we create a way to manage skills via a select
       or popover, both in general and in the table. */
    includes: ["education"],
  });
  return <ContextTable data={courses} />;
};
