import { useRouter } from 'next/navigation';
import { type MouseEvent, useCallback, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { deleteCourse } from '~/actions/courses/delete-course';
import { updateCourse } from '~/actions/courses/update-course';

import { DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Icon } from '~/components/icons/Icon';
import { type DataTableRowAction } from '~/components/tables';
import { type CoursesTableModel } from '~/features/courses';

interface CallbackParams {
  close: (evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
}

export const useCoursesTableRowActions = () => {
  const { open } = useDrawers();

  const router = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();

  return useCallback(
    (course: CoursesTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: 'Edit',
        icon: <Icon className='text-blue-600' icon='pen-to-square' size='16px' />,
        isLoading: editPending,
        onClick: e => {
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
        content: 'Show',
        icon: <Icon className='text-gray-600' icon='eye' size='16px' />,
        isLoading: showPending,
        isVisible: !course.visible,
        loadingText: 'Showing',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateCourse>> | null = null;
            try {
              response = await updateCourse(course.id, { visible: true });
            } catch (err) {
              logger.errorUnsafe(err, `There was an error showing course with ID '${course.id}'!`);
              toast.error('There was an error showing the course. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error enabling course with ID '${course.id}'!`);
              toast.error('There was an error enabling the course. Please try again later.');
              instance.setLoading(false);
              return;
            }
            return showTransition(() => {
              router.refresh();
              instance.setLoading(false);
              close(e);
            });
          })();
        },
      },
      {
        content: 'Hide',
        icon: <Icon className='text-gray-600' icon='eye-slash' size='16px' />,
        isLoading: hidePending,
        isVisible: course.visible,
        loadingText: 'Hiding',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateCourse>> | null = null;
            try {
              response = await updateCourse(course.id, { visible: false });
            } catch (err) {
              logger.errorUnsafe(err, `There was an error hiding course with ID '${course.id}'!`);
              toast.error('There was an error hiding the course. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error hiding course with ID '${course.id}'!`);
              toast.error('There was an error hiding the course. Please try again later.');
              instance.setLoading(false);
              return;
            }
            return hideTransition(() => {
              router.refresh();
              instance.setLoading(false);
              close(e);
            });
          })();
        },
      },
      {
        content: 'Delete',
        icon: <Icon className='text-red-600' icon='trash-alt' size='16px' />,
        isLoading: deletePending,
        loadingText: 'Deleting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof deleteCourse>> | null = null;
            try {
              response = await deleteCourse(course.id);
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error deleting the course with ID '${course.id}'!`,
              );
              toast.error('There was an error deleting the course. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error deleting the course with ID '${course.id}'!`);
              toast.error('There was an error deleting the course. Please try again later.');
              instance.setLoading(false);
              return;
            }
            return deleteTransition(() => {
              router.refresh();
              instance.setLoading(false);
              close(e);
            });
          })();
        },
      },
    ],
    [deletePending, hidePending, showPending, editPending, open, router],
  );
};
