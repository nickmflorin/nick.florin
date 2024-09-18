import { TableControlBarPlaceholder } from "~/components/tables-v2/TableControlBarPlaceholder";

export interface SkillsTableControlBarPlaceholderProps {
  readonly targetId?: string;
}

export const SkillsTableControlBarPlaceholder = ({
  targetId,
}: SkillsTableControlBarPlaceholderProps): JSX.Element => (
  <TableControlBarPlaceholder canDeleteRows targetId={targetId} />
);
