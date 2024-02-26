import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface ChartFilterButtonProps
  extends Omit<IconButtonProps<{ as: "button" }>, "options" | "icon"> {}

export const ChartFilterButton = forwardRef<HTMLButtonElement, ChartFilterButtonProps>(
  (props: ChartFilterButtonProps, ref): JSX.Element => (
    <IconButton.Secondary
      {...props}
      ref={ref}
      size="medium"
      icon={{ name: "sliders" }}
      options={{ as: "button" }}
    />
  ),
);
