import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteRepository } from "~/actions/repositories/delete-repository";
import { updateRepository } from "~/actions/repositories/update-repository";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables";
import { type RepositoriesTableModel } from "~/features/repositories";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useRepositoriesTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [highlightPending, highlightTransition] = useTransition();
  const [unhighlightPending, unhighlightTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();

  return useCallback(
    (repository: RepositoriesTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: "Edit",
        isLoading: editPending,
        icon: <Icon icon="pen-to-square" size="16px" className="text-blue-600" />,
        onClick: async e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_REPOSITORY, {
              repositoryId: repository.id,
              eager: { slug: repository.slug },
            });
            close(e);
          });
        },
      },
      {
        isVisible: !repository.visible,
        content: "Show",
        loadingText: "Showing",
        icon: <Icon icon="eye" size="16px" className="text-gray-600" />,
        isLoading: showPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
          try {
            response = await updateRepository(repository.id, { visible: true });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error showing repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error showing the repository. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error showing repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error showing the repository. Please try again later.");
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
        isVisible: repository.visible,
        content: "Hide",
        loadingText: "Hiding",
        icon: <Icon icon="eye-slash" size="16px" className="text-gray-600" />,
        isLoading: hidePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
          try {
            response = await updateRepository(repository.id, { visible: false });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error hiding repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error hiding the repository. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error hiding repository with ID '${repository.id}'!`);
            toast.error("There was an error hiding the repository. Please try again later.");
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
          let response: Awaited<ReturnType<typeof deleteRepository>> | null = null;
          try {
            response = await deleteRepository(repository.id);
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error deleting the repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error deleting the repository. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error deleting the repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error deleting the repository. Please try again later.");
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
      {
        isVisible: !repository.highlighted,
        content: "Highlight",
        loadingText: "Highlighting",
        icon: <Icon icon="star" size="16px" className="text-gray-600" />,
        isLoading: highlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
          try {
            response = await updateRepository(repository.id, { highlighted: true });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error highlighting repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error highlighting the repository. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error highlighting repository with ID '${repository.id}'!`,
            );
            toast.error("There was an error highlighting the repository. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return highlightTransition(() => {
            refresh();
            instance.setLoading(false);
            close(e);
          });
        },
      },
      {
        isVisible: repository.highlighted,
        content: "Unhighlight",
        loadingText: "Unhighlighting",
        icon: <Icon icon="ban" size="16px" className="text-gray-600" />,
        isLoading: unhighlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
          try {
            response = await updateRepository(repository.id, { highlighted: false });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error unhighlighting repository with ID '${repository.id}'!`,
            );
            toast.error(
              "There was an error unhighlighting the repository. Please try again later.",
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
              "There was an error unhighlighting the repository. Please try again later.",
            );
            instance.setLoading(false);
            return;
          }
          return unhighlightTransition(() => {
            refresh();
            instance.setLoading(false);
            close(e);
          });
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
      refresh,
    ],
  );
};
