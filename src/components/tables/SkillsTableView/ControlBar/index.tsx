import { Suspense } from "react";

import { TableControlBar, type TableControlBarProps } from "../../TableControlBar";
import { type Filters } from "../types";

import { TableFilters } from "./TableFilters";

export interface ControlBarProps extends TableControlBarProps {
  readonly filters: Filters;
  readonly page: number;
}

export const ControlBar = async ({ filters, page, ...props }: ControlBarProps) => (
  <TableControlBar {...props}>
    <Suspense>
      <TableFilters filters={filters} page={page} />
    </Suspense>
  </TableControlBar>
);
