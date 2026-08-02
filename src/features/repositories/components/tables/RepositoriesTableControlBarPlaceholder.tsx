import { type JSX } from 'react';

import { HideButton } from '~/components/buttons/HideButton';
import { HighlightButton } from '~/components/buttons/HighlightButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import { UnhighlightButton } from '~/components/buttons/UnhighlightButton';
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from '~/components/tables/ConnectedTableControlBarPlaceholder';

export interface RepositoriesTableControlBarPlaceholderProps extends Omit<
  ConnectedTableControlBarPlaceholderProps,
  'children'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const RepositoriesTableControlBarPlaceholder = (
  props: RepositoriesTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled />
    <HideButton isDisabled />
    <HighlightButton isDisabled />
    <UnhighlightButton isDisabled />
  </ConnectedTableControlBarPlaceholder>
);
