import { Suspense } from "react";

import { TableControlBar, type TableControlBarProps } from "../../TableControlBar";
import { type Filters } from "../types";

import { TableFilters } from "./TableFilters";

export interface ControlBarProps extends TableControlBarProps {
  readonly filters: Filters;
}

export const ControlBar = async ({ filters, ...props }: ControlBarProps) => (
  <TableControlBar {...props}>
    <Suspense>
      <TableFilters filters={filters} />
    </Suspense>
  </TableControlBar>
);
