import dynamic from "next/dynamic";

import { isUuid } from "~/lib/typeguards";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { Loading } from "~/components/feedback/Loading";
import { useCourse } from "~/hooks";

import { Drawer } from "./Drawer";
import { DrawerContent } from "./DrawerContent";
import { DrawerHeader } from "./DrawerHeader";

import { type ExtendingDrawerProps } from ".";

const CourseForm = dynamic(() => import("~/components/forms/courses/UpdateCourseF"), {
  loading: () => <Loading isLoading={true} />,
});

interface UpdateCourseDrawerProps
  extends ExtendingDrawerProps<{
    readonly courseId: string;
  }> {}

export const UpdateCourseDrawer = ({ courseId }: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useCourse(isUuid(courseId) ? courseId : null, {
    includes: ["education"],
    visibility: "admin",
    keepPreviousData: true,
  });
  return (
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {course => (
          <>
            <DrawerHeader>{course.shortName ?? course.name}</DrawerHeader>
            <DrawerContent>
              <CourseForm course={course} />
            </DrawerContent>
          </>
        )}
      </ApiResponseState>
    </Drawer>
  );
};

export default UpdateCourseDrawer;
