import { HideButton } from "~/components/buttons/HideButton";
import { ShowButton } from "~/components/buttons/ShowButton";
import {
  ConnectedTableControlBarPlaceholder,
  type ConnectedTableControlBarPlaceholderProps,
} from "~/components/tables-v2/ConnectedTableControlBarPlaceholder";

export interface CoursesTableControlBarPlaceholderProps
  extends Omit<ConnectedTableControlBarPlaceholderProps, "children"> {
  readonly controlBarTooltipsInPortal?: boolean;
}

export const CoursesTableControlBarPlaceholder = (
  props: CoursesTableControlBarPlaceholderProps,
): JSX.Element => (
  <ConnectedTableControlBarPlaceholder {...props}>
    <ShowButton isDisabled={true} />
    <HideButton isDisabled={true} />
  </ConnectedTableControlBarPlaceholder>
);
