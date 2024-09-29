import { type CoursesFilters } from "~/actions";
import { fetchCoursesCount } from "~/actions/courses/fetch-courses";

export interface CoursesTitleProps {
  readonly filters: CoursesFilters;
}

export const CoursesTitle = async ({ filters }: CoursesTitleProps) => {
  const {
    data: { count },
  } = await fetchCoursesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
