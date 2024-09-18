import type { BrandCourse } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useCourseForm } from "~/features/courses/components/forms/hooks";
import { UpdateCourseForm } from "~/features/courses/components/forms/UpdateCourseF";
import { useCourse } from "~/hooks";

interface UpdateCourseDrawerProps extends ExtendingDrawerProps {
  readonly courseId: string;
  readonly eager: Pick<BrandCourse, "name">;
}

export const UpdateCourseDrawer = ({
  courseId,
  eager,
  onClose,
}: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useCourse(isUuid(courseId) ? courseId : null, {
    query: { includes: ["education", "skills"], visibility: "admin" },
    keepPreviousData: true,
  });
  const form = useCourseForm();

  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {course => (
          <UpdateCourseForm form={form} course={course} onSuccess={onClose} onCancel={onClose} />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;
