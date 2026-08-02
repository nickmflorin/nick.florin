import { type JSX } from 'react';

import { HideButton } from '~/components/buttons/HideButton';
import { HighlightButton } from '~/components/buttons/HighlightButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import { UnhighlightButton } from '~/components/buttons/UnhighlightButton';
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from '~/components/tables/ConnectedTableControlBarPlaceholder';

export interface EducationsTableControlBarPlaceholderProps extends Omit<
  ConnectedTableControlBarPlaceholderProps,
  'children'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const EducationsTableControlBarPlaceholder = (
  props: EducationsTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled />
    <HideButton isDisabled />
    <HighlightButton isDisabled />
    <UnhighlightButton isDisabled />
  </ConnectedTableControlBarPlaceholder>
);
