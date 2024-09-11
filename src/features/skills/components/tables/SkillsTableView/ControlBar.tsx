import dynamic from "next/dynamic";

import { ContextTableControlBar } from "~/components/tables/generic/ContextTableControlBar";
import { DeleteManyButtonPlaceholder } from "~/components/tables/generic/DeleteManyButtonPlaceholder";

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
  <ContextTableControlBar deleteButton={<DeleteManyButton />}>
    <TableFilters filters={filters} page={page} />
  </ContextTableControlBar>
);
