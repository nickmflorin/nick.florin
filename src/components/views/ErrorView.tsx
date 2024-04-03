import { View } from "~/components/views/View";

import { Error, type ErrorProps } from "./Error";
import { parseErrorContent } from "./types";

export type ErrorViewProps = ErrorProps & {
  readonly screen?: boolean;
  readonly overlay?: boolean;
  readonly dimmed?: boolean;
  readonly blurred?: boolean;
};

export const ErrorView = ({
  className,
  style,
  screen,
  overlay,
  dimmed,
  blurred,
  ...props
}: ErrorViewProps) => {
  const content = parseErrorContent(props);
  if (!content) {
    return <></>;
  }
  return (
    <View
      className={className}
      style={style}
      dimmed={dimmed}
      screen={screen}
      blurred={blurred}
      overlay={overlay}
    >
      <Error {...(props as ErrorProps)} />
    </View>
  );
};
