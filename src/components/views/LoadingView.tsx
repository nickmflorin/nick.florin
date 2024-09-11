import React from "react";

import { type SpinnerProps } from "~/components/icons";
import { Spinner } from "~/components/icons/Spinner";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { AbstractView, type AbstractViewProps } from "./AbstractView";

export interface LoadingViewProps
  extends Pick<
    AbstractViewProps,
    "overlay" | "dimmed" | "blurred" | "fillScreen" | "fill" | keyof ComponentProps
  > {
  readonly spinner?: boolean;
  readonly isLoading?: boolean;
  readonly spinnerSize?: Exclude<SpinnerProps["size"], "full">;
}

export const LoadingView = ({
  spinnerSize = "24px",
  spinner = true,
  isLoading,
  fill = "parent",
  fillScreen = false,
  ...props
}: LoadingViewProps) => (
  <AbstractView
    {...props}
    fill={fillScreen ? "screen" : fill}
    overflow="hidden"
    absolute
    centerChildren
    className={classNames(
      "loading",
      {
        /* If the spinner is being displayed, the view needs to have a higher z-index than it other
           wise would.  This is such that the spinner appears over the content.  This will prevent
           scroll behavior on the content, but only when the spinner is present. */
        "z-50": isLoading && spinner,
        "z-20": isLoading && !spinner,
        "z-0": !isLoading && [props.blurred, props.dimmed, props.overlay].includes(true),
      },
      { "is-loading": isLoading },
      props.className,
    )}
  >
    {spinner && isLoading ? <Spinner size={spinnerSize} isLoading={true} /> : <></>}
  </AbstractView>
);
