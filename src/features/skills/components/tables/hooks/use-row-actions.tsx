import { useRouter } from 'next/navigation';
import { type MouseEvent, useCallback, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { deleteSkill } from '~/actions/skills/delete-skill';
import { updateSkill } from '~/actions/skills/update-skill';

import { DrawerIds } from '~/components/drawers';
import { useDrawers } from '~/components/drawers/hooks/use-drawers';
import { Icon } from '~/components/icons/Icon';
import { type DataTableRowAction } from '~/components/tables';
import { type SkillsTableModel } from '~/features/skills';

interface CallbackParams {
  close: (evt: Event | MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
}

export const useSkillsTableRowActions = () => {
  const { open } = useDrawers();

  const router = useRouter();

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
        content: 'Edit',
        icon: <Icon className='text-blue-600' icon='pen-to-square' size='16px' />,
        isLoading: editPending,
        onClick: e => {
          editTransition(() => {
            open(DrawerIds.UPDATE_SKILL, { eager: { label: skill.label }, skillId: skill.id });
            close(e);
          });
        },
      },
      {
        content: 'Show',
        icon: <Icon className='text-gray-600' icon='eye' size='16px' />,
        isLoading: showPending,
        isVisible: !skill.visible,
        loadingText: 'Showing',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { visible: true });
            } catch (err) {
              logger.errorUnsafe(err, `There was an error showing skill with ID '${skill.id}'!`);
              toast.error('There was an error showing the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error enabling skill with ID '${skill.id}'!`);
              toast.error('There was an error enabling the skill. Please try again later.');
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
        isVisible: skill.visible,
        loadingText: 'Hiding',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { visible: false });
            } catch (err) {
              logger.errorUnsafe(err, `There was an error hiding skill with ID '${skill.id}'!`);
              toast.error('There was an error hiding the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error hiding skill with ID '${skill.id}'!`);
              toast.error('There was an error hiding the skill. Please try again later.');
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
            let response: Awaited<ReturnType<typeof deleteSkill>> | null = null;
            try {
              response = await deleteSkill(skill.id);
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error deleting the skill with ID '${skill.id}'!`,
              );
              toast.error('There was an error deleting the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error deleting the skill with ID '${skill.id}'!`);
              toast.error('There was an error deleting the skill. Please try again later.');
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
        isVisible: !skill.highlighted,
        loadingText: 'Highlighting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { highlighted: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error highlighting skill with ID '${skill.id}'!`,
              );
              toast.error('There was an error highlighting the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error highlighting skill with ID '${skill.id}'!`);
              toast.error('There was an error highlighting the skill. Please try again later.');
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
        isVisible: skill.highlighted,
        loadingText: 'Unhighlighting',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { highlighted: false });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error unhighlighting skill with ID '${skill.id}'!`,
              );
              toast.error('There was an error unhighlighting the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error unhighlighting skill with ID '${skill.id}'!`);
              toast.error('There was an error unhighlighting the skill. Please try again later.');
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
      {
        content: 'Prioritize',
        icon: <Icon className='text-gray-600' icon='arrow-up-1-9' size='16px' />,
        isLoading: prioritizePending,
        isVisible: !skill.prioritized,
        loadingText: 'Prioritizing',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { prioritized: true });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error prioritizing skill with ID '${skill.id}'!`,
              );
              toast.error('There was an error prioritizing the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error prioritizing skill with ID '${skill.id}'!`);
              toast.error('There was an error prioritizing the skill. Please try again later.');
              instance.setLoading(false);
              return;
            }
            return prioritizeTransition(() => {
              router.refresh();
              instance.setLoading(false);
              close(e);
            });
          })();
        },
      },
      {
        content: 'Deprioritize',
        icon: <Icon className='text-gray-600' icon='arrow-down-1-9' size='16px' />,
        isLoading: deprioritizePending,
        isVisible: skill.prioritized,
        loadingText: 'Deprioritizing',
        onClick: (e, instance) => {
          void (async () => {
            instance.setLoading(true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { prioritized: false });
            } catch (err) {
              logger.errorUnsafe(
                err,
                `There was an error deprioritizing skill with ID '${skill.id}'!`,
              );
              toast.error('There was an error deprioritizing the skill. Please try again later.');
              return instance.setLoading(false);
            }
            const { error } = response;
            if (error) {
              logger.error(error, `There was an error deprioritizing skill with ID '${skill.id}'!`);
              toast.error('There was an error deprioritizing the skill. Please try again later.');
              instance.setLoading(false);
              return;
            }
            return deprioritizeTransition(() => {
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
      deprioritizePending,
      prioritizePending,
      open,
      router,
    ],
  );
};
