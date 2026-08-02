import { type JSX } from 'react';

import { HideButton } from '~/components/buttons/HideButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from '~/components/tables/ConnectedTableControlBarPlaceholder';

export interface CoursesTableControlBarPlaceholderProps extends Omit<
  ConnectedTableControlBarPlaceholderProps,
  'children'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const CoursesTableControlBarPlaceholder = (
  props: CoursesTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled />
    <HideButton isDisabled />
  </ConnectedTableControlBarPlaceholder>
);
