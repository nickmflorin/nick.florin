import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteCourse } from "~/actions-v2/courses/delete-course";
import { updateCourse } from "~/actions-v2/courses/update-course";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables";
import { type CoursesTableModel } from "~/features/courses";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useCoursesTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();

  return useCallback(
    (course: CoursesTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: "Edit",
        isLoading: editPending,
        icon: <Icon icon="pen-to-square" size="16px" className="text-blue-600" />,
        onClick: async e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_COURSE, {
              courseId: course.id,
              eager: { name: course.name },
            });
            close(e);
          });
        },
      },
      {
        isVisible: !course.visible,
        content: "Show",
        loadingText: "Showing",
        icon: <Icon icon="eye" size="16px" className="text-gray-600" />,
        isLoading: showPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateCourse>> | null = null;
          try {
            response = await updateCourse(course.id, { visible: true });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error showing course with ID '${course.id}'!`);
            toast.error("There was an error showing the course. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error enabling course with ID '${course.id}'!`);
            toast.error("There was an error enabling the course. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return showTransition(() => {
            refresh();
            instance.setLoading(false);
            close(e);
          });
        },
      },
      {
        isVisible: course.visible,
        content: "Hide",
        loadingText: "Hiding",
        icon: <Icon icon="eye-slash" size="16px" className="text-gray-600" />,
        isLoading: hidePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateCourse>> | null = null;
          try {
            response = await updateCourse(course.id, { visible: false });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error hiding course with ID '${course.id}'!`);
            toast.error("There was an error hiding the course. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error hiding course with ID '${course.id}'!`);
            toast.error("There was an error hiding the course. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return hideTransition(() => {
            refresh();
            instance.setLoading(false);
            close(e);
          });
        },
      },
      {
        content: "Delete",
        isLoading: deletePending,
        loadingText: "Deleting",
        icon: <Icon icon="trash-alt" size="16px" className="text-red-600" />,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof deleteCourse>> | null = null;
          try {
            response = await deleteCourse(course.id);
          } catch (e) {
            logger.errorUnsafe(e, `There was an error deleting the course with ID '${course.id}'!`);
            toast.error("There was an error deleting the course. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error deleting the course with ID '${course.id}'!`);
            toast.error("There was an error deleting the course. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return deleteTransition(() => {
            refresh();
            instance.setLoading(false);
            close(e);
          });
        },
      },
    ],
    [deletePending, hidePending, showPending, editPending, open, refresh],
  );
};
