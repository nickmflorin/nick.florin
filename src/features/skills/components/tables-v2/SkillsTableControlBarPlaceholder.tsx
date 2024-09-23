import { AddToTopSkillsButton } from "~/components/buttons/AddToTopSkillsButton";
import { HideButton } from "~/components/buttons/HideButton";
import { RemoveFromTopSkillsButton } from "~/components/buttons/RemoveFromTopSkilsButton";
import { ShowButton } from "~/components/buttons/ShowButton";
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
    <AddToTopSkillsButton isDisabled={true} />
    <RemoveFromTopSkillsButton isDisabled={true} />
  </ConnectedTableControlBarPlaceholder>
);
