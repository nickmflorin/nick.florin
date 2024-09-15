import { isUuid } from "~/lib/typeguards";
import type { BrandCourse } from "~/prisma/model";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useCourseForm } from "~/components/forms/courses/hooks";
import { UpdateCourseForm } from "~/components/forms/courses/UpdateCourseF";
import { useCourse } from "~/hooks";

interface UpdateCourseDrawerProps extends ExtendingDrawerProps {
  readonly courseId: string;
  readonly eager: Pick<BrandCourse, "name">;
}

export const UpdateCourseDrawer = ({ courseId, eager }: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useCourse(isUuid(courseId) ? courseId : null, {
    query: { includes: ["education", "skills"], visibility: "admin" },
    keepPreviousData: true,
  });
  const form = useCourseForm();

  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {course => <UpdateCourseForm form={form} course={course} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;