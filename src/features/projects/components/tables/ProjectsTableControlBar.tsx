"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteProjects } from "~/actions/projects/delete-projects";
import { hideProjects } from "~/actions/projects/hide-projects";
import { highlightProjects } from "~/actions/projects/highlight-projects";
import { showProjects } from "~/actions/projects/show-projects";
import { unhighlightProjects } from "~/actions/projects/unhighlight-projects";

import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import { Tooltip } from "~/components/floating/Tooltip";
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from "~/components/tables/ConnectedTableControlBar";
import { type ProjectsTableColumn, type ProjectsTableModel } from "~/features/projects";

export interface ProjectsTableControlBarProps
  extends Omit<
    ConnectedTableControlBarProps<ProjectsTableModel, ProjectsTableColumn>,
    "children" | "confirmationModal" | "modelName" | "deleteAction"
  > {}

export const ProjectsTableControlBar = (props: ProjectsTableControlBarProps): JSX.Element => {
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
      modelName="project"
      deleteAction={deleteProjects}
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
              content={`Show ${numHidden} selected project${numHidden <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numHidden === 0 || props.isDisabled === true}
            >
              <ShowButton
                isDisabled={numHidden === 0 || props.isDisabled}
                isLoading={isShowing}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof showProjects>> | null = null;
                  setIsShowing(true);
                  try {
                    response = await showProjects(
                      selectedRows.filter(row => !row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error showing the projects.", {
                      projects: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an error updaitng the projects.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error showing the projects.", {
                      projects: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an updating the projects.");
                  }
                  transition(() => {
                    refresh();
                    setIsShowing(false);
                    toast.success("The projects have been made visible.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Hide ${numVisible} selected project${numVisible <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numVisible === 0 || props.isDisabled === true}
            >
              <HideButton
                isDisabled={numVisible === 0 || props.isDisabled}
                isLoading={isHiding}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof hideProjects>> | null = null;
                  setIsHiding(true);
                  try {
                    response = await hideProjects(
                      selectedRows.filter(row => row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error hiding the projects.", {
                      projects: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the projects.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error hiding the projects.", {
                      projects: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the projects.");
                  }
                  transition(() => {
                    refresh();
                    setIsHiding(false);
                    toast.success("The projects have been hidden.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Highlight ${numNotHighlighted} selected project${numNotHighlighted <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numNotHighlighted === 0 || props.isDisabled === true}
            >
              <HighlightButton
                isDisabled={numNotHighlighted === 0 || props.isDisabled}
                isLoading={isHighlighting}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof highlightProjects>> | null = null;
                  setIsHighlighting(true);
                  try {
                    response = await highlightProjects(
                      selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error highlighting the projects.", {
                      projects: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the projects.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error highlighting the projects.", {
                      projects: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the projects.");
                  }
                  transition(() => {
                    refresh();
                    setIsHighlighting(false);
                    toast.success("The projects have been highlighted.");
                  });
                }}
              />
            </Tooltip>
            <Tooltip
              placement="top-start"
              inPortal={props.tooltipsInPortal}
              offset={{ mainAxis: 6 }}
              content={`Unhighlight ${numHighlighted} selected project${numHighlighted <= 1 ? "" : "s"}.`}
              className="text-sm"
              isDisabled={numHighlighted === 0 || props.isDisabled === true}
            >
              <UnhighlightButton
                isDisabled={numHighlighted === 0 || props.isDisabled}
                isLoading={isUnhighlighting}
                onClick={async () => {
                  let response: Awaited<ReturnType<typeof unhighlightProjects>> | null = null;
                  setIsUnhighlighting(true);
                  try {
                    response = await unhighlightProjects(
                      selectedRows.filter(row => row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error unhighlighting the projects.", {
                      projects: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the projects.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error unhighlighting the projects.", {
                      projects: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the projects.");
                  }
                  transition(() => {
                    refresh();
                    setIsUnhighlighting(false);
                    toast.success("The projects have been unhighlighted.");
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
