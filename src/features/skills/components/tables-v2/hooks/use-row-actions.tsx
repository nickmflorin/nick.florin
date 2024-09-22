import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteSkill } from "~/actions-v2/skills/delete-skill";
import { updateSkill } from "~/actions-v2/skills/update-skill";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables-v2";
import { type SkillsTableModel } from "~/features/skills";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useSkillsTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [enablePending, enableTransition] = useTransition();
  const [disablePending, disableTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();

  return useCallback(
    (skill: SkillsTableModel, { close }: CallbackParams): DataTableRowAction[] => [
      {
        content: "Edit",
        isLoading: editPending,
        icon: <Icon icon="pen-to-square" size="16px" className="text-blue-600" />,
        onClick: async e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_SKILL, { skillId: skill.id, eager: { label: skill.label } });
            close(e);
          });
        },
      },
      {
        isVisible: !skill.visible,
        content: "Show",
        loadingText: "Showing",
        icon: <Icon icon="volume-high" size="16px" className="text-gray-600" />,
        isLoading: enablePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
          try {
            response = await updateSkill(skill.id, { visible: true });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error showing skill with ID '${skill.id}'!`);
            toast.error("There was an error showing the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error enabling skill with ID '${skill.id}'!`);
            toast.error("There was an error enabling the skill. Please try again later.");
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
        isVisible: skill.visible,
        content: "Hide",
        loadingText: "Hiding",
        icon: <Icon icon="volume-xmark" size="16px" className="text-gray-600" />,
        isLoading: disablePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
          try {
            response = await updateSkill(skill.id, { visible: false });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error hiding skill with ID '${skill.id}'!`);
            toast.error("There was an error hiding the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error hiding skill with ID '${skill.id}'!`);
            toast.error("There was an error hiding the skill. Please try again later.");
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
          let response: Awaited<ReturnType<typeof deleteSkill>> | null = null;
          try {
            response = await deleteSkill(skill.id);
          } catch (e) {
            logger.errorUnsafe(e, `There was an error deleting the skill with ID '${skill.id}'!`);
            toast.error("There was an error deleting the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error deleting the skill with ID '${skill.id}'!`);
            toast.error("There was an error deleting the skill. Please try again later.");
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
