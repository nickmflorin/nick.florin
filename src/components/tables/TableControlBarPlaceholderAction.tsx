import { type ComponentType } from 'react';

type TableControlBarPlaceholderActionButtonProps = {
  readonly isDisabled?: boolean;
};

export type TableControlBarPlaceholderActionConfig = {
  readonly button: ComponentType<TableControlBarPlaceholderActionButtonProps>;
};

export interface TableControlBarPlaceholderActionProps {
  readonly button: ComponentType<TableControlBarPlaceholderActionButtonProps>;
}

export const TableControlBarPlaceholderAction = ({
  button,
}: TableControlBarPlaceholderActionProps) => {
  const Btn = button;
  return <Btn isDisabled />;
};
