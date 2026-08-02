'use client';
import { type JSX } from 'react';

import { deleteExperiences } from '~/actions/experiences/delete-experiences';
import { hideExperiences } from '~/actions/experiences/hide-experiences';
import { highlightExperiences } from '~/actions/experiences/highlight-experiences';
import { makeExperiencesInPerson } from '~/actions/experiences/make-experiences-in-person';
import { makeExperiencesRemote } from '~/actions/experiences/make-experiences-remote';
import { showExperiences } from '~/actions/experiences/show-experiences';
import { unhighlightExperiences } from '~/actions/experiences/unhighlight-experiences';

import { HideButton } from '~/components/buttons/HideButton';
import { HighlightButton } from '~/components/buttons/HighlightButton';
import { InPersonButton } from '~/components/buttons/InPersonButton';
import { RemoteButton } from '~/components/buttons/RemoteButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import { UnhighlightButton } from '~/components/buttons/UnhighlightButton';
import {
  ConnectedTableControlBar,
  type ConnectedTableControlBarProps,
} from '~/components/tables/ConnectedTableControlBar';
import { type ExperiencesTableColumn, type ExperiencesTableModel } from '~/features/experiences';

export interface ExperiencesTableControlBarProps extends Omit<
  ConnectedTableControlBarProps<ExperiencesTableModel, ExperiencesTableColumn>,
  'children' | 'confirmationModal' | 'deleteAction' | 'modelName'
> {}

export const ExperiencesTableControlBar = (props: ExperiencesTableControlBarProps): JSX.Element => (
  <ConnectedTableControlBar
    {...props}
    actions={[
      {
        action: showExperiences,
        button: ShowButton,
        errorMessage: 'There was an error updating the experiences.',
        logErrorMessage: 'There was an error showing the experiences.',
        rowFilter: row => !row.visible,
        successMessage: 'The experiences are now visible.',
        tooltipLabel: count => `Show ${count} selected experience${count <= 1 ? '' : 's'}.`,
      },
      {
        action: hideExperiences,
        button: HideButton,
        errorMessage: 'There was an error updating the experiences.',
        logErrorMessage: 'There was an error hiding the experiences.',
        rowFilter: row => row.visible,
        successMessage: 'The experiences are now hidden.',
        tooltipLabel: count => `Hide ${count} selected experience${count <= 1 ? '' : 's'}.`,
      },
      {
        action: highlightExperiences,
        button: HighlightButton,
        errorMessage: 'There was an error updating the experiences.',
        logErrorMessage: 'There was an error highlighting the experiences.',
        rowFilter: row => !row.highlighted,
        successMessage: 'The experiences are now highlighted.',
        tooltipLabel: count => `Highlight ${count} selected experience${count <= 1 ? '' : 's'}.`,
      },
      {
        action: unhighlightExperiences,
        button: UnhighlightButton,
        errorMessage: 'There was an error updating the experiences.',
        logErrorMessage: 'There was an error unhighlighting the experiences.',
        rowFilter: row => row.highlighted,
        successMessage: 'The experiences are no longer highlighted.',
        tooltipLabel: count => `Unhighlight ${count} selected experience${count <= 1 ? '' : 's'}.`,
      },
      {
        action: makeExperiencesRemote,
        button: RemoteButton,
        errorMessage: 'There was an error updating the experiences.',
        logErrorMessage: 'There was an error changing the experiences to remote.',
        rowFilter: row => !row.isRemote,
        successMessage: 'The experiences are now remote.',
        tooltipLabel: count => `Make ${count} selected experience${count <= 1 ? '' : 's'} remote.`,
      },
      {
        action: makeExperiencesInPerson,
        button: InPersonButton,
        errorMessage: 'There was an error updating the experiences.',
        logErrorMessage: 'There was an error making the experiences in-person.',
        rowFilter: row => row.isRemote,
        successMessage: 'The experiences are no longer remote.',
        tooltipLabel: count =>
          `Make ${count} selected experience${count <= 1 ? '' : 's'} in-person.`,
      },
    ]}
    data={props.data}
    deleteAction={deleteExperiences}
    modelName='experience'
  />
);
