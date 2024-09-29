import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteProject } from "~/actions/projects/delete-project";
import { updateProject } from "~/actions/projects/update-project";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables";
import { type ProjectsTableModel } from "~/features/projects";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useProjectsTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();
  const [highlightPending, highlightTransition] = useTransition();
  const [unhighlightPending, unhighlightTransition] = useTransition();

  return useCallback(
    (project: ProjectsTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: "Edit",
        isLoading: editPending,
        icon: <Icon icon="pen-to-square" size="16px" className="text-blue-600" />,
        onClick: async e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_PROJECT, {
              projectId: project.id,
              eager: { name: project.name },
            });
            close(e);
          });
        },
      },
      {
        isVisible: !project.visible,
        content: "Show",
        loadingText: "Showing",
        icon: <Icon icon="eye" size="16px" className="text-gray-600" />,
        isLoading: showPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateProject>> | null = null;
          try {
            response = await updateProject(project.id, { visible: true });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error showing project with ID '${project.id}'!`);
            toast.error("There was an error showing the project. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error enabling project with ID '${project.id}'!`);
            toast.error("There was an error enabling the project. Please try again later.");
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
        isVisible: project.visible,
        content: "Hide",
        loadingText: "Hiding",
        icon: <Icon icon="eye-slash" size="16px" className="text-gray-600" />,
        isLoading: hidePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateProject>> | null = null;
          try {
            response = await updateProject(project.id, { visible: false });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error hiding project with ID '${project.id}'!`);
            toast.error("There was an error hiding the project. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error hiding project with ID '${project.id}'!`);
            toast.error("There was an error hiding the project. Please try again later.");
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
          let response: Awaited<ReturnType<typeof deleteProject>> | null = null;
          try {
            response = await deleteProject(project.id);
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error deleting the project with ID '${project.id}'!`,
            );
            toast.error("There was an error deleting the project. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error deleting the project with ID '${project.id}'!`);
            toast.error("There was an error deleting the project. Please try again later.");
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
        isVisible: !project.highlighted,
        content: "Highlight",
        loadingText: "Highlighting",
        icon: <Icon icon="star" size="16px" className="text-gray-600" />,
        isLoading: highlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateProject>> | null = null;
          try {
            response = await updateProject(project.id, { highlighted: true });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error highlighting project with ID '${project.id}'!`,
            );
            toast.error("There was an error highlighting the project. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error highlighting project with ID '${project.id}'!`);
            toast.error("There was an error highlighting the project. Please try again later.");
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
        isVisible: project.highlighted,
        content: "Unhighlight",
        loadingText: "Unhighlighting",
        icon: <Icon icon="ban" size="16px" className="text-gray-600" />,
        isLoading: unhighlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateProject>> | null = null;
          try {
            response = await updateProject(project.id, { highlighted: false });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error unhighlighting project with ID '${project.id}'!`,
            );
            toast.error("There was an error unhighlighting the project. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error unhighlighting project with ID '${project.id}'!`,
            );
            toast.error("There was an error unhighlighting the project. Please try again later.");
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
      highlightPending,
      unhighlightPending,
      open,
      refresh,
    ],
  );
};
