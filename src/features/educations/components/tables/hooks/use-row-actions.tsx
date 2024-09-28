import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteEducation } from "~/actions-v2/educations/delete-education";
import { updateEducation } from "~/actions-v2/educations/update-education";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables";
import { type EducationsTableModel } from "~/features/educations";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useEducationsTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();
  const [highlightPending, highlightTransition] = useTransition();
  const [unhighlightPending, unhighlightTransition] = useTransition();

  return useCallback(
    (education: EducationsTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: "Edit",
        isLoading: editPending,
        icon: <Icon icon="pen-to-square" size="16px" className="text-blue-600" />,
        onClick: async e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_EDUCATION, {
              educationId: education.id,
              eager: { major: education.major },
            });
            close(e);
          });
        },
      },
      {
        isVisible: !education.visible,
        content: "Show",
        loadingText: "Showing",
        icon: <Icon icon="eye" size="16px" className="text-gray-600" />,
        isLoading: showPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
          try {
            response = await updateEducation(education.id, { visible: true });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error showing education with ID '${education.id}'!`,
            );
            toast.error("There was an error showing the education. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error showing education with ID '${education.id}'!`);
            toast.error("There was an error showing the education. Please try again later.");
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
        isVisible: education.visible,
        content: "Hide",
        loadingText: "Hiding",
        icon: <Icon icon="eye-slash" size="16px" className="text-gray-600" />,
        isLoading: hidePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
          try {
            response = await updateEducation(education.id, { visible: false });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error hiding education with ID '${education.id}'!`);
            toast.error("There was an error hiding the education. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error hiding education with ID '${education.id}'!`);
            toast.error("There was an error hiding the education. Please try again later.");
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
          let response: Awaited<ReturnType<typeof deleteEducation>> | null = null;
          try {
            response = await deleteEducation(education.id);
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error deleting the education with ID '${education.id}'!`,
            );
            toast.error("There was an error deleting the education. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error deleting the education with ID '${education.id}'!`,
            );
            toast.error("There was an error deleting the education. Please try again later.");
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
        isVisible: !education.highlighted,
        content: "Highlight",
        loadingText: "Highlighting",
        icon: <Icon icon="star" size="16px" className="text-gray-600" />,
        isLoading: highlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
          try {
            response = await updateEducation(education.id, { highlighted: true });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error highlighting education with ID '${education.id}'!`,
            );
            toast.error("There was an error highlighting the education. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error highlighting education with ID '${education.id}'!`,
            );
            toast.error("There was an error highlighting the education. Please try again later.");
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
        isVisible: education.highlighted,
        content: "Unhighlight",
        loadingText: "Unhighlighting",
        icon: <Icon icon="ban" size="16px" className="text-gray-600" />,
        isLoading: unhighlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
          try {
            response = await updateEducation(education.id, { highlighted: false });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error unhighlighting education with ID '${education.id}'!`,
            );
            toast.error("There was an error unhighlighting the education. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error unhighlighting education with ID '${education.id}'!`,
            );
            toast.error("There was an error unhighlighting the education. Please try again later.");
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
