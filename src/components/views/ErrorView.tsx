import { View, type ViewProps } from "~/components/views/View";

import { Error, type ErrorProps } from "./Error";

export interface ErrorViewProps extends ErrorProps, Omit<ViewProps, "children"> {}

export const ErrorView = ({ children, ...props }: ErrorViewProps) => (
  <View {...props}>
    <Error {...props}>{children}</Error>
  </View>
);
