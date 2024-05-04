import { forwardRef } from "react";

import { IconButton, type IconButtonProps } from "./generic";

export interface ChartFilterButtonProps
  extends Omit<IconButtonProps<"button">, "options" | "icon"> {}

export const ChartFilterButton = forwardRef<HTMLButtonElement, ChartFilterButtonProps>(
  (props: ChartFilterButtonProps, ref): JSX.Element => (
    <IconButton.Secondary
      size="medium"
      {...props}
      ref={ref}
      icon={{ name: "sliders" }}
      as="button"
    />
  ),
);
