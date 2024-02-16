import { IconButton } from "~/components/buttons";

export interface CancelActionProps {
  readonly id?: string;
  readonly isVisible?: boolean;
  readonly isDisabled?: boolean;
  readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const CancelAction = ({ onClick, isVisible = true, ...props }: CancelActionProps) =>
  isVisible ? (
    <IconButton.Transparent
      {...props}
      className="text-red-500 hover:text-red-600 disabled:text-gray-400"
      icon={{ name: "circle-xmark", iconStyle: "solid" }}
      onClick={onClick}
      size="24px"
      iconSize="16px"
    />
  ) : (
    <></>
  );
