import { type JSX } from 'react';

import { DetailEntityType } from '~/database/model';

import {
  UpdateDetailsDrawer,
  type UpdateDetailsDrawerProps,
} from '~/features/resume/components/drawers/UpdateDetailsDrawer';

interface UpdateExperienceDetailsDrawerProps extends Omit<
  UpdateDetailsDrawerProps<typeof DetailEntityType.EXPERIENCE>,
  'entityType'
> {}

export const UpdateExperienceDetailsDrawer = (
  props: UpdateExperienceDetailsDrawerProps,
): JSX.Element => <UpdateDetailsDrawer {...props} entityType={DetailEntityType.EXPERIENCE} />;
