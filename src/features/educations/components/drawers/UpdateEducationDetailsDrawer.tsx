import { type JSX } from 'react';

import { DetailEntityType } from '~/database/model';

import {
  UpdateDetailsDrawer,
  type UpdateDetailsDrawerProps,
} from '~/features/resume/components/drawers/UpdateDetailsDrawer';

interface UpdateEducationDetailsDrawerProps extends Omit<
  UpdateDetailsDrawerProps<typeof DetailEntityType.EDUCATION>,
  'entityType'
> {}

export const UpdatEducationDetailsDrawer = (
  props: UpdateEducationDetailsDrawerProps,
): JSX.Element => <UpdateDetailsDrawer {...props} entityType={DetailEntityType.EDUCATION} />;
