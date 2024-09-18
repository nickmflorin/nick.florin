import { TableControlBar, type TableControlBarProps } from "~/components/tables-v2/TableControlBar";
import { type SkillsTableModel } from "~/features/skills/types";

export interface SkillsTableControlBarProps
  extends Omit<TableControlBarProps<SkillsTableModel>, "children"> {}

export const SkillsTableControlBar = ({
  selectedRows,
  ...props
}: SkillsTableControlBarProps): JSX.Element => (
  <TableControlBar {...props} selectedRows={selectedRows} />
);
