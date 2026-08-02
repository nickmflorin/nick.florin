import { useRouter } from 'next/navigation';
import { type MouseEvent, useCallback, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { deleteRepository } from '~/actions/repositories/delete-repository';
import { updateRepository } from '~/actions/repositories/update-repository';

import { DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Icon } from '~/components/icons/Icon';
import { type DataTableRowAction } from '~/components/tables';
import { type RepositoriesTableModel } from '~/features/repositories';

interface CallbackParams {
  close: (evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
}

export const useRepositoriesTableRowActions = () => {
  const { open } = useDrawers();

  const router = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [highlightPending, highlightTransition] = useTransition();
  const [unhighlightPending, unhighlightTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();

  return useCallback(
    (repository: RepositoriesTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: 'Edit',
        icon: <Icon className='text-blue-600' icon='pen-to-square' size='16px' />,
        isLoading: editPending,
        onClick: e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_REPOSITORY, {
              eager: { slug: repository.slug },
              repositoryId: repository.id,
            });
            close(e);
          });
        },
      },
      {
        content: 'Show',
        icon: <Icon className='text-gray-600' icon='eye' size='16px' />,
        isLoading: showPending,
        isVisible: !repository.visible,
        loadingText: 'Showing',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
            try {
              response = await updateRepository(repository.id, { visible: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error showing repository with ID '${repository.id}'!`,
              );
              toast.error('There was an error showing the repository. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error showing repository with ID '${repository.id}'!`,
              );
              toast.error('There was an error showing the repository. Please try again later.');
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
        isVisible: repository.visible,
        loadingText: 'Hiding',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
            try {
              response = await updateRepository(repository.id, { visible: false });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error hiding repository with ID '${repository.id}'!`,
              );
              toast.error('There was an error hiding the repository. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error hiding repository with ID '${repository.id}'!`,
              );
              toast.error('There was an error hiding the repository. Please try again later.');
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
            let response: Awaited<ReturnType<typeof deleteRepository>> | null = null;
            try {
              response = await deleteRepository(repository.id);
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error deleting the repository with ID '${repository.id}'!`,
              );
              toast.error('There was an error deleting the repository. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error deleting the repository with ID '${repository.id}'!`,
              );
              toast.error('There was an error deleting the repository. Please try again later.');
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
        isVisible: !repository.highlighted,
        loadingText: 'Highlighting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
            try {
              response = await updateRepository(repository.id, { highlighted: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error highlighting repository with ID '${repository.id}'!`,
              );
              toast.error(
                'There was an error highlighting the repository. Please try again later.',
              );
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error highlighting repository with ID '${repository.id}'!`,
              );
              toast.error(
                'There was an error highlighting the repository. Please try again later.',
              );
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
        isVisible: repository.highlighted,
        loadingText: 'Unhighlighting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
            try {
              response = await updateRepository(repository.id, { highlighted: false });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error unhighlighting repository with ID '${repository.id}'!`,
              );
              toast.error(
                'There was an error unhighlighting the repository. Please try again later.',
              );
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error unhighlighting repository with ID '${repository.id}'!`,
              );
              toast.error(
                'There was an error unhighlighting the repository. Please try again later.',
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
      unhighlightPending,
      highlightPending,
      open,
      router,
    ],
  );
};
