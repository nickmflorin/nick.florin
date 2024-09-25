import dynamic from "next/dynamic";

import { type CoursesControls, type CoursesFilters } from "~/actions-v2";
import { fetchCourses } from "~/actions-v2/courses/fetch-courses";

import { Loading } from "~/components/loading/Loading";

const ClientCoursesTableBody = dynamic(
  () =>
    import("~/features/courses/components/tables-v2/CoursesTableBody").then(
      mod => mod.CoursesTableBody,
    ),
  { loading: () => <Loading isLoading component="tbody" /> },
);

export interface CoursesTableBodyProps {
  readonly filters: CoursesFilters;
  readonly page: number;
  readonly ordering: CoursesControls["ordering"];
}

export const CoursesTableBody = async ({
  filters,
  page,
  ordering,
}: CoursesTableBodyProps): Promise<JSX.Element> => {
  const fetcher = fetchCourses(["skills", "education"]);
  const { data: courses } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return <ClientCoursesTableBody data={courses} />;
};
