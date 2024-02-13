import { type DataTableColumn } from "mantine-datatable";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import { type ComponentProps } from "~/components/types";

export const TableSizes = enumeratedLiterals(["sm", "md", "lg"] as const, {});
export type TableSize = EnumeratedLiteralsType<typeof TableSizes>;

export interface TableProps<T extends { id: string }> extends ComponentProps {
  readonly data: T[];
  readonly columns: DataTableColumn<T>[];
  readonly size?: TableSize;
  readonly loading?: boolean;
}
