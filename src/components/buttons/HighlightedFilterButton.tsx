import { forwardRef } from "react";

import { FilterButton, type FilterButtonProps, type FilterButtonInstance } from "./FilterButton";

export interface HighlightedFilterButtonProps
  extends Omit<FilterButtonProps, "icons" | "classNames"> {}

export const HighlightedFilterButton = forwardRef<
  FilterButtonInstance,
  HighlightedFilterButtonProps
>((props, ref) => <FilterButton {...props} icons={{ true: "star", false: "ban" }} ref={ref} />);
