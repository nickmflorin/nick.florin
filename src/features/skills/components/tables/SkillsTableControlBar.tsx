'use client';
import { useRouter } from 'next/navigation';
import { type JSX, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { deleteSkills } from '~/actions/skills/delete-skills';
import { deprioritizeSkills } from '~/actions/skills/deprioritize-skills';
import { hideSkills } from '~/actions/skills/hide-skills';
import { highlightSkills } from '~/actions/skills/highlight-skills';
import { prioritizeSkills } from '~/actions/skills/prioritize-skills';
import { showSkills } from '~/actions/skills/show-skills';
import { unhighlightSkills } from '~/actions/skills/unhighlight-skills';

import { DeprioritizeButton } from '~/components/buttons/DeprioritizeButton';
import { HideButton } from '~/components/buttons/HideButton';
import { HighlightButton } from '~/components/buttons/HighlightButton';
import { PrioritizeButton } from '~/components/buttons/PrioritizeButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import { UnhighlightButton } from '~/components/buttons/UnhighlightButton';
import { Tooltip } from '~/components/floating/Tooltip';
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from '~/components/tables/ConnectedTableControlBar';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills';

export interface SkillsTableControlBarProps extends Omit<
  ConnectedTableControlBarProps<SkillsTableModel, SkillsTableColumn>,
  'children' | 'confirmationModal' | 'deleteAction' | 'modelName'
> {}

export const SkillsTableControlBar = (props: SkillsTableControlBarProps): JSX.Element => {
  const router = useRouter();

  const [isHiding, setIsHiding] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isUnhighlighting, setIsUnhighlighting] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isDeprioritizing, setIsDeprioritizing] = useState(false);

  const [_, transition] = useTransition();

  return (
    <ConnectedTableControlBar
      {...props}
      data={props.data}
      deleteAction={deleteSkills}
      modelName='skill'
    >
      {({ selectedRows }) => {
        const numVisible = selectedRows.filter(row => row.visible).length;
        const numHidden = selectedRows.filter(row => !row.visible).length;
        const numHighlighted = selectedRows.filter(row => row.highlighted).length;
        const numNotHighlighted = selectedRows.filter(row => !row.highlighted).length;
        const numPrioritized = selectedRows.filter(row => row.prioritized).length;
        const numNotPrioritized = selectedRows.filter(row => !row.prioritized).length;
        return (
          <>
            <Tooltip
              className='text-sm'
              content={`Show ${numHidden} selected skill${numHidden <= 1 ? '' : 's'}.`}
              isDisabled={numHidden === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <ShowButton
                isDisabled={numHidden === 0 || props.isDisabled}
                isLoading={isShowing}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof showSkills>> | null = null;
                  setIsShowing(true);
                  try {
                    response = await showSkills(
                      selectedRows.filter(row => !row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error showing the skills.', {
                      skills: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error showing the skills.', {
                      skills: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error('There was an updating the skills.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsShowing(false);
                    toast.success('The skills have been made visible.');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              className='text-sm'
              content={`Hide ${numVisible} selected skill${numVisible <= 1 ? '' : 's'}.`}
              isDisabled={numVisible === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <HideButton
                isDisabled={numVisible === 0 || props.isDisabled}
                isLoading={isHiding}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof hideSkills>> | null = null;
                  setIsHiding(true);
                  try {
                    response = await hideSkills(
                      selectedRows.filter(row => row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error hiding the skills.', {
                      skills: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error('There was an updating the skills.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error hiding the skills.', {
                      skills: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error('There was an updating the skills.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsHiding(false);
                    toast.success('The skills have been hidden.');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              className='text-sm'
              content={
                `Highlight ${numNotHighlighted} selected skill` +
                `${numNotHighlighted <= 1 ? '' : 's'}.`
              }
              isDisabled={numNotHighlighted === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <HighlightButton
                isDisabled={numNotHighlighted === 0 || props.isDisabled}
                isLoading={isHighlighting}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof highlightSkills>> | null = null;
                  setIsHighlighting(true);
                  try {
                    response = await highlightSkills(
                      selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error highlighting the skills.', {
                      skills: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error highlighting the skills.', {
                      skills: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsHighlighting(false);
                    toast.success('The skills have been highlighted.');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              className='text-sm'
              content={
                `Unhighlight ${numHighlighted} selected skill` +
                `${numHighlighted <= 1 ? '' : 's'}.`
              }
              isDisabled={numHighlighted === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <UnhighlightButton
                isDisabled={numHighlighted === 0 || props.isDisabled}
                isLoading={isUnhighlighting}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof unhighlightSkills>> | null = null;
                  setIsUnhighlighting(true);
                  try {
                    response = await unhighlightSkills(
                      selectedRows.filter(row => row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error unhighlighting the skills.', {
                      skills: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error unhighlighting the skills.', {
                      skills: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsUnhighlighting(false);
                    toast.success('The skills have been unhighlighted.');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              className='text-sm'
              content={
                `Prioritize ${numNotPrioritized} selected skill` +
                `${numNotPrioritized <= 1 ? '' : 's'}.`
              }
              isDisabled={numNotPrioritized === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <PrioritizeButton
                isDisabled={numNotPrioritized === 0 || props.isDisabled}
                isLoading={isPrioritizing}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof prioritizeSkills>> | null = null;
                  setIsPrioritizing(true);
                  try {
                    response = await prioritizeSkills(
                      selectedRows.filter(row => !row.prioritized).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error prioritizing the skills.', {
                      skills: selectedRows.filter(row => !row.prioritized).map(row => row.id),
                    });
                    setIsPrioritizing(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error prioritizing the skills.', {
                      skills: selectedRows.filter(row => !row.prioritized).map(row => row.id),
                    });
                    setIsPrioritizing(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsPrioritizing(false);
                    toast.success('The skills have been prioritized.');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              className='text-sm'
              content={
                `Deprioritize ${numPrioritized} selected skill` +
                `${numPrioritized <= 1 ? '' : 's'}.`
              }
              isDisabled={numPrioritized === 0 || props.isDisabled === true}
              isInPortal={props.areTooltipsInPortal}
              offset={{ mainAxis: 6 }}
              placement='top-start'
            >
              <DeprioritizeButton
                isDisabled={numPrioritized === 0 || props.isDisabled}
                isLoading={isDeprioritizing}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof deprioritizeSkills>> | null = null;
                  setIsDeprioritizing(true);
                  try {
                    response = await deprioritizeSkills(
                      selectedRows.filter(row => row.prioritized).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, 'There was an error deprioritizing the skills.', {
                      skills: selectedRows.filter(row => row.prioritized).map(row => row.id),
                    });
                    setIsDeprioritizing(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, 'There was an error deprioritizing the skills.', {
                      skills: selectedRows.filter(row => row.prioritized).map(row => row.id),
                    });
                    setIsDeprioritizing(false);
                    return toast.error('There was an error updating the skills.');
                  }
                  transition(() => {
                    router.refresh();
                    setIsDeprioritizing(false);
                    toast.success('The skills have been deprioritized.');
                  });
                }}
              />
            </Tooltip>
          </>
        );
      }}
    </ConnectedTableControlBar>
  );
};
