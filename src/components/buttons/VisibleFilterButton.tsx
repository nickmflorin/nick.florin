import { forwardRef } from "react";

import { FilterButton, type FilterButtonProps, type FilterButtonInstance } from "./FilterButton";

export interface VisibleFilterButtonProps extends Omit<FilterButtonProps, "icons" | "classNames"> {}

export const VisibleFilterButton = forwardRef<FilterButtonInstance, VisibleFilterButtonProps>(
  (props, ref) => <FilterButton {...props} icons={{ true: "eye", false: "eye-slash" }} ref={ref} />,
);
