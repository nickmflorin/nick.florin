import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface ChartFilterButtonProps
  extends Omit<IconButtonProps<"button">, "options" | "icon" | "element"> {}

export const ChartFilterButton = forwardRef<HTMLButtonElement, ChartFilterButtonProps>(
  (props: ChartFilterButtonProps, ref): JSX.Element => (
    <IconButton.Solid
      size="medium"
      scheme="secondary"
      {...props}
      ref={ref}
      icon={{ name: "sliders" }}
      element="button"
    />
  ),
);
