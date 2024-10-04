import {
  View,
  type ViewSizeProps,
  type ViewFillProps,
  type ViewPositionProps,
} from "~/components/structural/View";
import { type ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { EmptyMessage, type EmptyMessageProps } from "./EmptyMessage";

export interface EmptyViewProps
  extends ComponentProps,
    ViewSizeProps,
    ViewPositionProps,
    ViewFillProps,
    Omit<EmptyMessageProps, keyof ComponentProps> {}

export const EmptyView = ({ children, fill = "parent", ...props }: EmptyViewProps) => (
  <View
    {...props}
    fill={fill}
    centerChildren
    overflow="hidden"
    __default_position__="relative"
    className={classNames("p-2", props.className)}
  >
    <EmptyMessage {...props}>{children}</EmptyMessage>
  </View>
);
