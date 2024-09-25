import { CoursesFiltersObj } from "~/actions-v2";
import { fetchCoursesCount } from "~/actions-v2/courses/fetch-courses";

export interface CoursesTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function CoursesTitlePage({ searchParams }: CoursesTitlePageProps) {
  const filters = CoursesFiltersObj.parse(searchParams);
  const {
    data: { count },
  } = await fetchCoursesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
}
