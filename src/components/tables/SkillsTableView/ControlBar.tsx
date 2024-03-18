import dynamic from "next/dynamic";

import { DeleteManyButtonPlaceholder } from "../DeleteManyButtonPlaceholder";
import { TableControlBar } from "../TableControlBar";

import { TableFilters } from "./TableFilters";
import { type Filters } from "./types";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

interface ControlBarProps {
  readonly filters: Filters;
  readonly page: number;
}

export const ControlBar = ({ filters, page }: ControlBarProps) => (
  <TableControlBar deleteButton={<DeleteManyButton />}>
    <TableFilters filters={filters} page={page} />
  </TableControlBar>
);
