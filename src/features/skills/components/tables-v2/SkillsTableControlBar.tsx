"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { hideSkills } from "~/actions-v2/skills/hide-skills";
import { includeSkillsInTop } from "~/actions-v2/skills/include-skills-in-top";
import { removeSkillsFromTop } from "~/actions-v2/skills/remove-skills-from-top";
import { showSkills } from "~/actions-v2/skills/show-skills";

import { DisableButton } from "~/components/buttons/DisableButton";
import { EnableButton } from "~/components/buttons/EnableButton";
import { Tooltip } from "~/components/floating/Tooltip";
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from "~/components/tables-v2/ConnectedTableControlBar";
import { type SkillsTableColumn, type SkillsTableModel } from "~/features/skills";

const DeleteSkillsConfirmationDialog = dynamic(() =>
  import("../dialogs/DeleteSkillsConfirmationDialog").then(
    mod => mod.DeleteSkillsConfirmationDialog,
  ),
);

export interface SkillsTableControlBarProps
  extends Omit<
    ConnectedTableControlBarProps<SkillsTableModel, SkillsTableColumn>,
    "children" | "confirmationModal"
  > {}

export const SkillsTableControlBar = (props: SkillsTableControlBarProps): JSX.Element => {
  const { refresh } = useRouter();

  const [isHiding, setIsHiding] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [isIncluding, setIsIncluding] = useState(false);
  const [isExcluding, setIsExcluding] = useState(false);

  const [_, transition] = useTransition();

  return (
    <ConnectedTableControlBar
      {...props}
      data={props.data}
      confirmationModal={DeleteSkillsConfirmationDialog}
    >
      {({ selectedRows }) => {
        const numVisible = selectedRows.filter(row => row.visible).length;
        const numHidden = selectedRows.filter(row => !row.visible).length;
        const numTopSkills = selectedRows.filter(row => row.includeInTopSkills).length;
        const numNotTopSkills = selectedRows.filter(row => !row.includeInTopSkills).length;
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
              <EnableButton
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
                      subscriptions: selectedRows.map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an error updaitng the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error showing the skills.", {
                      subscriptions: selectedRows.map(row => row.id),
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
              <DisableButton
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
                      subscriptions: selectedRows.map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error hiding the skills.", {
                      subscriptions: selectedRows.map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsHiding(false);
                    toast.success("The subscriptions have been hidden.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Include ${numNotTopSkills} selected skill${numNotTopSkills <= 1 ? "" : "s"} in "Top Skills".`}
              className="text-sm"
              isDisabled={numNotTopSkills === 0 || props.isDisabled === true}
            >
              <EnableButton
                isDisabled={numNotTopSkills === 0 || props.isDisabled}
                isLoading={isIncluding}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof includeSkillsInTop>> | null = null;
                  setIsIncluding(true);
                  try {
                    response = await includeSkillsInTop(
                      selectedRows.filter(row => !row.includeInTopSkills).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(
                      e,
                      "There was an error including the skills in top skills.",
                      { subscriptions: selectedRows.map(row => row.id) },
                    );
                    setIsIncluding(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error including the skills in top skills.", {
                      subscriptions: selectedRows.map(row => row.id),
                    });
                    setIsIncluding(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsIncluding(false);
                    /* eslint-disable-next-line quotes */
                    toast.success('The skills have been moved to "Top Skills".');
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Remove ${numTopSkills} selected skill${numTopSkills <= 1 ? "" : "s"} from "Top Skills".`}
              className="text-sm"
              isDisabled={numTopSkills === 0 || props.isDisabled === true}
            >
              <EnableButton
                isDisabled={numTopSkills === 0 || props.isDisabled}
                isLoading={isExcluding}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof removeSkillsFromTop>> | null = null;
                  setIsExcluding(true);
                  try {
                    response = await removeSkillsFromTop(
                      selectedRows.filter(row => row.includeInTopSkills).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(
                      e,
                      "There was an error removing the skills from top skills.",
                      { subscriptions: selectedRows.map(row => row.id) },
                    );
                    setIsExcluding(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error removing the skills from top skills.", {
                      subscriptions: selectedRows.map(row => row.id),
                    });
                    setIsExcluding(false);
                    return toast.error("There was an error updating the skills.");
                  }
                  transition(() => {
                    refresh();
                    setIsExcluding(false);
                    /* eslint-disable-next-line quotes */
                    toast.success('The skills have been removed from "Top Skills".');
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
