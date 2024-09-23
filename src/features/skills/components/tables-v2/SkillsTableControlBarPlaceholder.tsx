import { DeprioritizeButton } from "~/components/buttons/DeprioritizeButton";
import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { PrioritizeButton } from "~/components/buttons/PrioritizeButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from "~/components/tables-v2/ConnectedTableControlBarPlaceholder";

export interface SkillsTableControlBarPlaceholderProps
  extends Omit<ConnectedTableControlBarPlaceholderProps, "children"> {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const SkillsTableControlBarPlaceholder = (
  props: SkillsTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled={true} />
    <HideButton isDisabled={true} />
    <HighlightButton isDisabled={true} />
    <UnhighlightButton isDisabled={true} />
    <PrioritizeButton isDisabled={true} />
    <DeprioritizeButton isDisabled={true} />
  </ConnectedTableControlBarPlaceholder>
);
