import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteSkill } from "~/actions-v2/skills/delete-skill";
import { updateSkill } from "~/actions-v2/skills/update-skill";

import { DrawerIds } from "~/components/drawers";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import Icon from "~/components/icons/Icon";
import { type DataTableRowAction } from "~/components/tables";
import { type SkillsTableModel } from "~/features/skills";

interface CallbackParams {
  close: (
    evt: Event | React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const useSkillsTableRowActions = () => {
  const { open } = useDrawers();

  const { refresh } = useRouter();

  const [showPending, showTransition] = useTransition();
  const [hidePending, hideTransition] = useTransition();
  const [deletePending, deleteTransition] = useTransition();
  const [editPending, editTransition] = useTransition();
  const [highlightPending, highlightTransition] = useTransition();
  const [unhighlightPending, unhighlightTransition] = useTransition();
  const [prioritizePending, prioritizeTransition] = useTransition();
  const [deprioritizePending, deprioritizeTransition] = useTransition();

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
        icon: <Icon icon="eye" size="16px" className="text-gray-600" />,
        isLoading: showPending,
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
          return showTransition(() => {
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
        icon: <Icon icon="eye-slash" size="16px" className="text-gray-600" />,
        isLoading: hidePending,
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
      {
        isVisible: !skill.highlighted,
        content: "Highlight",
        loadingText: "Highlighting",
        icon: <Icon icon="star" size="16px" className="text-gray-600" />,
        isLoading: highlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
          try {
            response = await updateSkill(skill.id, { highlighted: true });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error highlighting skill with ID '${skill.id}'!`);
            toast.error("There was an error highlighting the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error highlighting skill with ID '${skill.id}'!`);
            toast.error("There was an error highlighting the skill. Please try again later.");
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
        isVisible: skill.highlighted,
        content: "Unhighlight",
        loadingText: "Unhighlighting",
        icon: <Icon icon="ban" size="16px" className="text-gray-600" />,
        isLoading: unhighlightPending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
          try {
            response = await updateSkill(skill.id, { highlighted: false });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error unhighlighting skill with ID '${skill.id}'!`);
            toast.error("There was an error unhighlighting the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error unhighlighting skill with ID '${skill.id}'!`);
            toast.error("There was an error unhighlighting the skill. Please try again later.");
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
      {
        isVisible: !skill.prioritized,
        content: "Prioritize",
        loadingText: "Prioritizing",
        icon: <Icon icon="arrow-up-1-9" size="16px" className="text-gray-600" />,
        isLoading: prioritizePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
          try {
            response = await updateSkill(skill.id, { prioritized: true });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error prioritizing skill with ID '${skill.id}'!`);
            toast.error("There was an error prioritizing the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error prioritizing skill with ID '${skill.id}'!`);
            toast.error("There was an error prioritizing the skill. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return prioritizeTransition(() => {
            refresh();
            instance.setLoading(false);
            close(e);
          });
        },
      },
      {
        isVisible: skill.prioritized,
        content: "Deprioritize",
        loadingText: "Deprioritizing",
        icon: <Icon icon="arrow-down-1-9" size="16px" className="text-gray-600" />,
        isLoading: deprioritizePending,
        onClick: async (e, instance) => {
          instance.setLoading(true);
          let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
          try {
            response = await updateSkill(skill.id, { prioritized: false });
          } catch (e) {
            logger.errorUnsafe(e, `There was an error deprioritizing skill with ID '${skill.id}'!`);
            toast.error("There was an error deprioritizing the skill. Please try again later.");
            return instance.setLoading(false);
          }
          const { error } = response;
          if (error) {
            logger.error(error, `There was an error deprioritizing skill with ID '${skill.id}'!`);
            toast.error("There was an error deprioritizing the skill. Please try again later.");
            instance.setLoading(false);
            return;
          }
          return deprioritizeTransition(() => {
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
      deprioritizePending,
      prioritizePending,
      open,
      refresh,
    ],
  );
};
