import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useCourse } from "~/hooks";

import { Drawer } from "../../Drawer";
import { type ExtendingDrawerProps } from "../../provider";

import { CourseDrawerContent } from "./CourseDrawerContent";

export interface CourseDrawerProps
  extends ExtendingDrawerProps<{
    readonly courseId: string;
  }> {}

export const CourseDrawer = ({ courseId }: CourseDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useCourse(courseId, {
    query: { includes: ["education", "skills"], visibility: "public" },
    keepPreviousData: true,
  });

  return (
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {course => <CourseDrawerContent course={course} />}
      </ApiResponseState>
    </Drawer>
  );
};

export default CourseDrawer;
