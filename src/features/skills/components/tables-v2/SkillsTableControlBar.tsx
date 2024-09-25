"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteSkills } from "~/actions-v2/skills/delete-skills";
import { deprioritizeSkills } from "~/actions-v2/skills/deprioritize-skills";
import { hideSkills } from "~/actions-v2/skills/hide-skills";
import { highlightSkills } from "~/actions-v2/skills/highlight-skills";
import { prioritizeSkills } from "~/actions-v2/skills/prioritize-skills";
import { showSkills } from "~/actions-v2/skills/show-skills";
import { unhighlightSkills } from "~/actions-v2/skills/unhighlight-skills";

import { DeprioritizeButton } from "~/components/buttons/DeprioritizeButton";
import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { PrioritizeButton } from "~/components/buttons/PrioritizeButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import { Tooltip } from "~/components/floating/Tooltip";
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from "~/components/tables-v2/ConnectedTableControlBar";
import { type SkillsTableColumn, type SkillsTableModel } from "~/features/skills";

export interface SkillsTableControlBarProps
  extends Omit<
    ConnectedTableControlBarProps<SkillsTableModel, SkillsTableColumn>,
    "children" | "confirmationModal" | "deleteAction" | "modelName"
  > {}

export const SkillsTableControlBar = (props: SkillsTableControlBarProps): JSX.Element => {
  const { refresh } = useRouter();

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
      modelName="skill"
      deleteAction={deleteSkills}
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
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Show ${numHidden} selected skill${numHidden <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numHidden === 0 || props.isDisabled === true}
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
                    logger.errorUnsafe(e, "There was an error showing the skills.", {
                      skills: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an error updaitng the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error showing the skills.", {
                      skills: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsShowing(false);
                    toast.success("The skills have been made visible.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Hide ${numVisible} selected skill${numVisible <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numVisible === 0 || props.isDisabled === true}
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
                    logger.errorUnsafe(e, "There was an error hiding the skills.", {
                      skills: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error hiding the skills.", {
                      skills: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsHiding(false);
                    toast.success("The skills have been hidden.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Highlight ${numNotHighlighted} selected skill${numNotHighlighted <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numNotHighlighted === 0 || props.isDisabled === true}
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
                    logger.errorUnsafe(e, "There was an error highlighting the skills.", {
                      skills: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error highlighting the skills.", {
                      skills: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsHighlighting(false);
                    toast.success("The skills have been highlighted.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Unhighlight ${numHighlighted} selected skill${numHighlighted <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numHighlighted === 0 || props.isDisabled === true}
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
                    logger.errorUnsafe(e, "There was an error unhighlighting the skills.", {
                      skills: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error unhighlighting the skills.", {
                      skills: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsUnhighlighting(false);
                    toast.success("The skills have been unhighlighted.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Prioritize ${numNotPrioritized} selected skill${numNotPrioritized <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numNotPrioritized === 0 || props.isDisabled === true}
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
                    logger.errorUnsafe(e, "There was an error prioritizing the skills.", {
                      skills: selectedRows.filter(row => !row.prioritized).map(row => row.id),
                    });
                    setIsPrioritizing(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error prioritizing the skills.", {
                      skills: selectedRows.filter(row => !row.prioritized).map(row => row.id),
                    });
                    setIsPrioritizing(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsPrioritizing(false);
                    toast.success("The skills have been prioritized.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Deprioritize ${numPrioritized} selected skill${numPrioritized <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numPrioritized === 0 || props.isDisabled === true}
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
                    logger.errorUnsafe(e, "There was an error deprioritizing the skills.", {
                      skills: selectedRows.filter(row => row.prioritized).map(row => row.id),
                    });
                    setIsDeprioritizing(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error deprioritizing the skills.", {
                      skills: selectedRows.filter(row => row.prioritized).map(row => row.id),
                    });
                    setIsDeprioritizing(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsDeprioritizing(false);
                    toast.success("The skills have been deprioritized.");
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
