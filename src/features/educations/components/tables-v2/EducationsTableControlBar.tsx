"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteEducations } from "~/actions-v2/educations/delete-educations";
import { hideEducations } from "~/actions-v2/educations/hide-educations";
import { highlightEducations } from "~/actions-v2/educations/highlight-educations";
import { showEducations } from "~/actions-v2/educations/show-educations";
import { unhighlightEducations } from "~/actions-v2/educations/unhighlight-educations";

import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import { Tooltip } from "~/components/floating/Tooltip";
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from "~/components/tables-v2/ConnectedTableControlBar";
import { type EducationsTableColumn, type EducationsTableModel } from "~/features/educations";

export interface EducationsTableControlBarProps
  extends Omit<
    ConnectedTableControlBarProps<EducationsTableModel, EducationsTableColumn>,
    "children" | "confirmationModal" | "deleteAction" | "modelName"
  > {}

export const EducationsTableControlBar = (props: EducationsTableControlBarProps): JSX.Element => {
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
      deleteAction={deleteEducations}
      modelName="education"
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
                  let response: Awaited<ReturnType<typeof showEducations>> | null = null;
                  setIsShowing(true);
                  try {
                    response = await showEducations(
                      selectedRows.filter(row => !row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error showing the educations.", {
                      educations: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an error updaitng the educations.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error showing the educations.", {
                      educations: selectedRows.filter(row => !row.visible).map(row => row.id),
                    });
                    setIsShowing(false);
                    return toast.error("There was an updating the educations.");
                  }
                  transition(() => {
                    refresh();
                    setIsShowing(false);
                    toast.success("The educations have been made visible.");
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
                  let response: Awaited<ReturnType<typeof hideEducations>> | null = null;
                  setIsHiding(true);
                  try {
                    response = await hideEducations(
                      selectedRows.filter(row => row.visible).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error hiding the educations.", {
                      educations: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the educations.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error hiding the educations.", {
                      educations: selectedRows.filter(row => row.visible).map(row => row.id),
                    });
                    setIsHiding(false);
                    return toast.error("There was an updating the educations.");
                  }
                  transition(() => {
                    refresh();
                    setIsHiding(false);
                    toast.success("The educations have been hidden.");
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
                  let response: Awaited<ReturnType<typeof highlightEducations>> | null = null;
                  setIsHighlighting(true);
                  try {
                    response = await highlightEducations(
                      selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error highlighting the educations.", {
                      educations: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the educations.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error highlighting the educations.", {
                      educations: selectedRows.filter(row => !row.highlighted).map(row => row.id),
                    });
                    setIsHighlighting(false);
                    return toast.error("There was an error updating the educations.");
                  }
                  transition(() => {
                    refresh();
                    setIsHighlighting(false);
                    toast.success("The educations have been highlighted.");
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
                  let response: Awaited<ReturnType<typeof unhighlightEducations>> | null = null;
                  setIsUnhighlighting(true);
                  try {
                    response = await unhighlightEducations(
                      selectedRows.filter(row => row.highlighted).map(row => row.id),
                    );
                  } catch (e) {
                    logger.errorUnsafe(e, "There was an error unhighlighting the educations.", {
                      educations: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the educations.");
                  }
                  const { error } = response;
                  if (error) {
                    logger.error(error, "There was an error unhighlighting the educations.", {
                      educations: selectedRows.filter(row => row.highlighted).map(row => row.id),
                    });
                    setIsUnhighlighting(false);
                    return toast.error("There was an error updating the educations.");
                  }
                  transition(() => {
                    refresh();
                    setIsUnhighlighting(false);
                    toast.success("The educations have been unhighlighted.");
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
