import { type CoursesFilters } from "~/actions-v2";
import { fetchCoursesCount } from "~/actions-v2/courses/fetch-courses";

export interface CoursesTitleProps {
  readonly filters: CoursesFilters;
}

export const CoursesTitle = async ({ filters }: CoursesTitleProps) => {
  const {
    data: { count },
  } = await fetchCoursesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
