import dynamic from "next/dynamic";
import { memo } from "react";

import { getCourses, type GetCoursesFilters } from "~/actions/fetches/courses";

import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface CoursesAdminTableProps {
  readonly page: number;
  readonly filters: GetCoursesFilters;
}

export const CoursesAdminTable = memo(async ({ page, filters }: CoursesAdminTableProps) => {
  const courses = await getCourses({
    page,
    filters,
    /* We will eventually need to include skills once we create a way to manage skills via a select
       or popover, both in general and in the table. */
    includes: ["education", "skills"],
    visibility: "admin",
  });
  return <ContextTable data={courses} />;
});
