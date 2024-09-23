import { DisableButton } from "~/components/buttons/DisableButton";
import { EnableButton } from "~/components/buttons/EnableButton";
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
    <EnableButton isDisabled={true} />
    <DisableButton isDisabled={true} />
    <EnableButton isDisabled={true} />
    <DisableButton isDisabled={true} />
  </ConnectedTableControlBarPlaceholder>
);
