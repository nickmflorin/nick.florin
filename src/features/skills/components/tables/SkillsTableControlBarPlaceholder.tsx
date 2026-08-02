import { type JSX } from 'react';

import { DeprioritizeButton } from '~/components/buttons/DeprioritizeButton';
import { HideButton } from '~/components/buttons/HideButton';
import { HighlightButton } from '~/components/buttons/HighlightButton';
import { PrioritizeButton } from '~/components/buttons/PrioritizeButton';
import { ShowButton } from '~/components/buttons/ShowButton';
import { UnhighlightButton } from '~/components/buttons/UnhighlightButton';
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from '~/components/tables/ConnectedTableControlBarPlaceholder';

export interface SkillsTableControlBarPlaceholderProps extends Omit<
  ConnectedTableControlBarPlaceholderProps,
  'children'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const SkillsTableControlBarPlaceholder = (
  props: SkillsTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled />
    <HideButton isDisabled />
    <HighlightButton isDisabled />
    <UnhighlightButton isDisabled />
    <PrioritizeButton isDisabled />
    <DeprioritizeButton isDisabled />
  </ConnectedTableControlBarPlaceholder>
);
