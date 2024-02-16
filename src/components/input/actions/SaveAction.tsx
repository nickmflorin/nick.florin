import { IconButton } from "~/components/buttons";

export interface SaveActionProps {
  readonly id?: string;
  readonly isVisible?: boolean;
  readonly isDisabled?: boolean;
  readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const SaveAction = ({ onClick, isVisible = true, ...props }: SaveActionProps) =>
  isVisible ? (
    <IconButton.Transparent
      {...props}
      className="text-green-600 hover:text-green-700 disabled:text-gray-400"
      icon={{ name: "circle-check", iconStyle: "solid" }}
      onClick={onClick}
      size="24px"
      iconSize="16px"
    />
  ) : (
    <></>
  );
