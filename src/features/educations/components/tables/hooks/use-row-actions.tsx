import { useRouter } from 'next/navigation';
import { type MouseEvent, useCallback, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { deleteEducation } from '~/actions/educations/delete-education';
import { updateEducation } from '~/actions/educations/update-education';

import { DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Icon } from '~/components/icons/Icon';
import { type DataTableRowAction } from '~/components/tables';
import { type EducationsTableModel } from '~/features/educations';

interface CallbackParams {
  close: (evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
}

export const useEducationsTableRowActions = () => {
  const { open } = useDrawers();

  const router = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();
  const [highlightPending, highlightTransition] = useTransition();
  const [unhighlightPending, unhighlightTransition] = useTransition();

  return useCallback(
    (education: EducationsTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: 'Edit',
        icon: <Icon className='text-blue-600' icon='pen-to-square' size='16px' />,
        isLoading: editPending,
        onClick: e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_EDUCATION, {
              eager: { major: education.major },
              educationId: education.id,
            });
            close(e);
          });
        },
      },
      {
        content: 'Show',
        icon: <Icon className='text-gray-600' icon='eye' size='16px' />,
        isLoading: showPending,
        isVisible: !education.visible,
        loadingText: 'Showing',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
            try {
              response = await updateEducation(education.id, { visible: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error showing education with ID '${education.id}'!`,
              );
              toast.error('There was an error showing the education. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error showing education with ID '${education.id}'!`,
              );
              toast.error('There was an error showing the education. Please try again later.');
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
        isVisible: education.visible,
        loadingText: 'Hiding',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
            try {
              response = await updateEducation(education.id, { visible: false });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error hiding education with ID '${education.id}'!`,
              );
              toast.error('There was an error hiding the education. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error hiding education with ID '${education.id}'!`);
              toast.error('There was an error hiding the education. Please try again later.');
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
            let response: Awaited<ReturnType<typeof deleteEducation>> | null = null;
            try {
              response = await deleteEducation(education.id);
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error deleting the education with ID '${education.id}'!`,
              );
              toast.error('There was an error deleting the education. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error deleting the education with ID '${education.id}'!`,
              );
              toast.error('There was an error deleting the education. Please try again later.');
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
      {
        content: 'Highlight',
        icon: <Icon className='text-gray-600' icon='star' size='16px' />,
        isLoading: highlightPending,
        isVisible: !education.highlighted,
        loadingText: 'Highlighting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
            try {
              response = await updateEducation(education.id, { highlighted: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error highlighting education with ID '${education.id}'!`,
              );
              toast.error('There was an error highlighting the education. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error highlighting education with ID '${education.id}'!`,
              );
              toast.error('There was an error highlighting the education. Please try again later.');
              instance.setLoading(false);
              return;
            }
            return highlightTransition(() => {
              router.refresh();
              instance.setLoading(false);
              close(e);
            });
          })();
        },
      },
      {
        content: 'Unhighlight',
        icon: <Icon className='text-gray-600' icon='ban' size='16px' />,
        isLoading: unhighlightPending,
        isVisible: education.highlighted,
        loadingText: 'Unhighlighting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
            try {
              response = await updateEducation(education.id, { highlighted: false });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error unhighlighting education with ID '${education.id}'!`,
              );
              toast.error(
                'There was an error unhighlighting the education. Please try again later.',
              );
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error unhighlighting education with ID '${education.id}'!`,
              );
              toast.error(
                'There was an error unhighlighting the education. Please try again later.',
              );
              instance.setLoading(false);
              return;
            }
            return unhighlightTransition(() => {
              router.refresh();
              instance.setLoading(false);
              close(e);
            });
          })();
        },
      },
    ],
    [
      deletePending,
      hidePending,
      showPending,
      editPending,
      highlightPending,
      unhighlightPending,
      open,
      router,
    ],
  );
};
