import dynamic from "next/dynamic";

import { type CoursesControls, type CoursesFilters } from "~/actions";
import { fetchCourses } from "~/actions/courses/fetch-courses";

import { Loading } from "~/components/loading/Loading";
import { CoursesTableControlBarPlaceholder } from "~/features/courses/components/tables/CoursesTableControlBarPlaceholder";

const ClientCoursesTableBody = dynamic(
  () =>
    import("~/features/courses/components/tables/CoursesTableBody").then(
      mod => mod.CoursesTableBody,
    ),
  {
    loading: () => (
      <>
        <CoursesTableControlBarPlaceholder />
        <Loading isLoading component="tbody" />
      </>
    ),
  },
);

const getCourses = async ({
  page,
  filters,
  ordering,
}: {
  readonly filters: CoursesFilters;
  readonly page: number;
  readonly ordering: CoursesControls["ordering"];
}) => {
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
  return courses;
};

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
  const courses = await getCourses({ page, filters, ordering });
  return <ClientCoursesTableBody data={courses} />;
};
