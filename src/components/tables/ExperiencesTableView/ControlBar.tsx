import { TableControlBar, type TableControlBarProps } from "../TableControlBar";

export interface ControlBarProps extends TableControlBarProps {}

export const ControlBar = async (props: ControlBarProps) => <TableControlBar {...props} />;
