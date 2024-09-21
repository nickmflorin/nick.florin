import dynamic from "next/dynamic";

import { ContextTableControlBar } from "~/components/tables/ContextTableControlBar";
import { DeleteManyButtonPlaceholder } from "~/components/tables/DeleteManyButtonPlaceholder";

import { TableFilters } from "./TableFilters";
import { type Filters } from "./types";

const DeleteManyButton = dynamic(() => import("./DeleteManyButton"), {
  loading: () => <DeleteManyButtonPlaceholder />,
});

interface ControlBarProps {
  readonly filters: Filters;
}

export const ControlBar = ({ filters }: ControlBarProps) => (
  <ContextTableControlBar deleteButton={<DeleteManyButton />}>
    <TableFilters filters={filters} />
  </ContextTableControlBar>
);
