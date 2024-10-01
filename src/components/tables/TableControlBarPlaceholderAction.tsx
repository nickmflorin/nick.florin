type TableControlBarPlaceholderActionButtonProps = {
  readonly isDisabled?: boolean;
};

export type TableControlBarPlaceholderActionConfig = {
  readonly button: React.ComponentType<TableControlBarPlaceholderActionButtonProps>;
};

export interface TableControlBarPlaceholderActionProps {
  readonly button: React.ComponentType<TableControlBarPlaceholderActionButtonProps>;
}

export const TableControlBarPlaceholderAction = ({
  button,
}: TableControlBarPlaceholderActionProps) => {
  const Btn = button;
  return <Btn isDisabled={true} />;
};
