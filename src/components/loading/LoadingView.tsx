import { type SpinnerProps } from "~/components/icons";
import { Spinner } from "~/components/icons/Spinner";
import { View, type ViewComponent, type ViewProps } from "~/components/structural/View";
import type { ComponentProps } from "~/components/types";
import { classNames, parseDataAttributes } from "~/components/types";

export interface LoadingViewProps<C extends ViewComponent>
  extends Pick<
    ViewProps<C>,
    | "fillScreen"
    | "fill"
    | "component"
    | "isDisabled"
    | "dim"
    | keyof ComponentProps
    | "position"
    | "component"
  > {
  readonly isLoading?: boolean;
  readonly spinnerSize?: SpinnerProps["size"];
  readonly spinnerProps?: Omit<SpinnerProps, "size" | "isLoading">;
}

export const LoadingView = <C extends ViewComponent>({
  spinnerSize = "24px",
  spinnerProps,
  isLoading,
  fill = "parent",
  fillScreen,
  ...props
}: LoadingViewProps<C>) => (
  <View
    {...props}
    {...parseDataAttributes({ isLoading, loadingView: true })}
    fill={fillScreen ? "screen" : fill}
    overflow="hidden"
    absolute
    centerChildren
    className={classNames(
      {
        /* If the spinner is being displayed, the view needs to have a higher z-index than it other
           wise would.  This is such that the spinner appears over the content.  This will prevent
           scroll behavior on the content, but only when the spinner is present. */
        "z-10": isLoading,
      },
      props.className,
    )}
  >
    <Spinner {...spinnerProps} size={spinnerSize} isLoading={isLoading} />
  </View>
);
