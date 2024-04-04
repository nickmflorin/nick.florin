import { type ComponentProps } from "~/components/types";

import { ErrorDetail, type ErrorDetailProps } from "../feedback/errors/ErrorDetail";

import { AbstractView, type AbstractViewProps } from "./AbstractView";

export type ErrorViewProps = Pick<
  AbstractViewProps,
  "overlay" | "dimmed" | "blurred" | "fillScreen" | "fill" | keyof ComponentProps
> &
  Omit<ErrorDetailProps, keyof ComponentProps>;

export const ErrorView = ({ fill = "parent", fillScreen = false, ...props }: ErrorViewProps) => (
  <AbstractView
    {...props}
    fill={fillScreen ? "screen" : fill}
    centerChildren
    overflow="hidden"
    absolute
  >
    <ErrorDetail {...props} />
  </AbstractView>
);
