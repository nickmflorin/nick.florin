import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { useCourse } from "~/hooks";

import { CourseDrawerContent } from "./CourseDrawerContent";

export interface CourseDrawerProps extends ExtendingDrawerProps {
  readonly courseId: string;
}

export const CourseDrawer = ({ courseId }: CourseDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useCourse(courseId, {
    query: { includes: ["education", "skills"], visibility: "public" },
    keepPreviousData: true,
  });

  return (
    <ContextDrawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {course => <CourseDrawerContent course={course} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

export default CourseDrawer;
