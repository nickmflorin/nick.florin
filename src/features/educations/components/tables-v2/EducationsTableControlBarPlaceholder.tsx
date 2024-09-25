import { HideButton } from "~/components/buttons/HideButton";
import { HighlightButton } from "~/components/buttons/HighlightButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import { UnhighlightButton } from "~/components/buttons/UnhighlightButton";
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from "~/components/tables-v2/ConnectedTableControlBarPlaceholder";

export interface EducationsTableControlBarPlaceholderProps
  extends Omit<ConnectedTableControlBarPlaceholderProps, "children"> {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const EducationsTableControlBarPlaceholder = (
  props: EducationsTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled={true} />
    <HideButton isDisabled={true} />
    <HighlightButton isDisabled={true} />
    <UnhighlightButton isDisabled={true} />
  </ConnectedTableControlBarPlaceholder>
);
