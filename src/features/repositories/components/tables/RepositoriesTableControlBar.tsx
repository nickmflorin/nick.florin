"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteRepositories } from "~/actions/repositories/delete-repositories";
import { hideRepositories } from "~/actions/repositories/hide-repositories";
import { highlightRepositories } from "~/actions/repositories/highlight-repositories";
import { showRepositories } from "~/actions/repositories/show-repositories";
import { unhighlightRepositories } from "~/actions/repositories/unhighlight-repositories";

import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import { Tooltip } from "~/components/floating/Tooltip";
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from "~/components/tables/ConnectedTableControlBar";
import { type RepositoriesTableColumn, type RepositoriesTableModel } from "~/features/repositories";

export interface RepositoriesTableControlBarProps
  extends Omit<
    ConnectedTableControlBarProps<RepositoriesTableModel, RepositoriesTableColumn>,
    "children" | "confirmationModal" | "deleteAction" | "modelName"
  > {}

export const RepositoriesTableControlBar = (
  props: RepositoriesTableControlBarProps,
): JSX.Element => {
  const { refresh } = useRouter();

  const [isHiding, setIsHiding] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isUnhighlighting, setIsUnhighlighting] = useState(false);

  const [_, transition] = useTransition();

  return (
    <ConnectedTableControlBar
      {...props}
      data={props.data}
      deleteAction={deleteRepositories}
      modelName="repository"
    >
      {({ selectedRows }) => {
        const numVisible = selectedRows.filter(row => row.visible).length;
        const numHidden = selectedRows.filter(row => !row.visible).length;
        const numHighlighted = selectedRows.filter(row => row.highlighted).length;
        const numNotHighlighted = selectedRows.filter(row => !row.highlighted).length;
        return (
          <>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Show ${numHidden} selected experience${numHidden <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numHidden === 0 || props.isDisabled === true}
            >
              <ShowButton
                isDisabled={numHidden === 0 || props.isDisabled}
                isLoading={isShowing}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof showRepositories>> | null = null;
                  setIsShowing(true);
                  try {
                    response = await showRepositories(
                      selectedRows.filter(row => !row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error showing the repositories.", {
                      repositories: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an error updaitng the repositories.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error showing the repositories.", {
                      repositories: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an updating the repositories.");
                  }
                  transition(() => {
                    refresh();
                    setIsShowing(false);
                    toast.success("The repositories have been made visible.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Hide ${numVisible} selected experience${numVisible <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numVisible === 0 || props.isDisabled === true}
            >
              <HideButton
                isDisabled={numVisible === 0 || props.isDisabled}
                isLoading={isHiding}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof hideRepositories>> | null = null;
                  setIsHiding(true);
                  try {
                    response = await hideRepositories(
                      selectedRows.filter(row => row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error hiding the repositories.", {
                      repositories: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the repositories.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error hiding the repositories.", {
                      repositories: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the repositories.");
                  }
                  transition(() => {
                    refresh();
                    setIsHiding(false);
                    toast.success("The repositories have been hidden.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Highlight ${numNotHighlighted} selected experience${numNotHighlighted <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numNotHighlighted === 0 || props.isDisabled === true}
            >
              <HighlightButton
                isDisabled={numNotHighlighted === 0 || props.isDisabled}
                isLoading={isHighlighting}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof highlightRepositories>> | null = null;
                  setIsHighlighting(true);
                  try {
                    response = await highlightRepositories(
                      selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error highlighting the repositories.", {
                      repositories: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the repositories.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error highlighting the repositories.", {
                      repositories: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the repositories.");
                  }
                  transition(() => {
                    refresh();
                    setIsHighlighting(false);
                    toast.success("The repositories have been highlighted.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Unhighlight ${numHighlighted} selected experience${numHighlighted <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numHighlighted === 0 || props.isDisabled === true}
            >
              <UnhighlightButton
                isDisabled={numHighlighted === 0 || props.isDisabled}
                isLoading={isUnhighlighting}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof unhighlightRepositories>> | null = null;
                  setIsUnhighlighting(true);
                  try {
                    response = await unhighlightRepositories(
                      selectedRows.filter(row => row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error unhighlighting the repositories.", {
                      repositories: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the repositories.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error unhighlighting the repositories.", {
                      repositories: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the repositories.");
                  }
                  transition(() => {
                    refresh();
                    setIsUnhighlighting(false);
                    toast.success("The repositories have been unhighlighted.");
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
