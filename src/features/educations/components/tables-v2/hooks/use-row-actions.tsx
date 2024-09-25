import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteEducation } from "~/actions-v2/educations/delete-education";
import { updateEducation } from "~/actions-v2/educations/update-education";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables-v2";
import { type EducationsTableModel } from "~/features/educations";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useEducationsTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [enablePending, enableTransition] = useTransition();
  const [disablePending, disableTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();

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
        isLoading: enablePending,
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
            logger.error(error, `There was an error enabling education with ID '${education.id}'!`);
            toast.error("There was an error enabling the education. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return enableTransition(() => {
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
        isLoading: disablePending,
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
          return disableTransition(() => {
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
    ],
    [deletePending, disablePending, enablePending, editPending, open, refresh],
  );
};
