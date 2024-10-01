"use client";
import { deleteExperiences } from "~/actions/experiences/delete-experiences";
import { hideExperiences } from "~/actions/experiences/hide-experiences";
import { highlightExperiences } from "~/actions/experiences/highlight-experiences";
import { makeExperiencesInPerson } from "~/actions/experiences/make-experiences-in-person";
import { makeExperiencesRemote } from "~/actions/experiences/make-experiences-remote";
import { showExperiences } from "~/actions/experiences/show-experiences";
import { unhighlightExperiences } from "~/actions/experiences/unhighlight-experiences";

import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { InPersonButton } from "~/components/buttons/InPersonButton";
import { RemoteButton } from "~/components/buttons/RemoteButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from "~/components/tables/ConnectedTableControlBar";
import { type ExperiencesTableColumn, type ExperiencesTableModel } from "~/features/experiences";

export interface ExperiencesTableControlBarProps
  extends Omit<
    ConnectedTableControlBarProps<ExperiencesTableModel, ExperiencesTableColumn>,
    "children" | "confirmationModal" | "deleteAction" | "modelName"
  > {}

export const ExperiencesTableControlBar = (props: ExperiencesTableControlBarProps): JSX.Element => (
  <ConnectedTableControlBar
    {...props}
    data={props.data}
    deleteAction={deleteExperiences}
    modelName="experience"
    actions={[
      {
        button: ShowButton,
        errorMessage: "There was an error updating the experiences.",
        logErrorMessage: "There was an error showing the experiences.",
        successMessage: "The experiences are now visible.",
        action: showExperiences,
        rowFilter: row => !row.visible,
        tooltipLabel: count => `Show ${count} selected experience${count <= 1 ? "" : "s"}.`,
      },
      {
        button: HideButton,
        errorMessage: "There was an error updating the experiences.",
        logErrorMessage: "There was an error hiding the experiences.",
        successMessage: "The experiences are now hidden.",
        action: hideExperiences,
        rowFilter: row => row.visible,
        tooltipLabel: count => `Hide ${count} selected experience${count <= 1 ? "" : "s"}.`,
      },
      {
        button: HighlightButton,
        errorMessage: "There was an error updating the experiences.",
        logErrorMessage: "There was an error highlighting the experiences.",
        successMessage: "The experiences are now highlighted.",
        action: highlightExperiences,
        rowFilter: row => !row.highlighted,
        tooltipLabel: count => `Highlight ${count} selected experience${count <= 1 ? "" : "s"}.`,
      },
      {
        button: UnhighlightButton,
        errorMessage: "There was an error updating the experiences.",
        logErrorMessage: "There was an error unhighlighting the experiences.",
        successMessage: "The experiences are no longer highlighted.",
        action: unhighlightExperiences,
        rowFilter: row => row.highlighted,
        tooltipLabel: count => `Unhighlight ${count} selected experience${count <= 1 ? "" : "s"}.`,
      },
      {
        button: RemoteButton,
        errorMessage: "There was an error updating the experiences.",
        logErrorMessage: "There was an error changing the experiences to remote.",
        successMessage: "The experiences are now remote.",
        action: makeExperiencesRemote,
        rowFilter: row => !row.isRemote,
        tooltipLabel: count => `Make ${count} selected experience${count <= 1 ? "" : "s"} remote.`,
      },
      {
        button: InPersonButton,
        errorMessage: "There was an error updating the experiences.",
        logErrorMessage: "There was an error making the experiences in-person.",
        successMessage: "The experiences are no longer remote.",
        action: makeExperiencesInPerson,
        rowFilter: row => row.isRemote,
        tooltipLabel: count =>
          `Make ${count} selected experience${count <= 1 ? "" : "s"} in-person.`,
      },
    ]}
  />
);
