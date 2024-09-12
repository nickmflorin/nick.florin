import { IconButton } from "~/components/buttons";

export interface DeleteManyButtonPlaceholderProps {
  readonly isCheckable?: boolean;
}

export const DeleteManyButtonPlaceholder = ({
  isCheckable = true,
}: DeleteManyButtonPlaceholderProps) => {
  if (isCheckable) {
    return <IconButton.Solid scheme="danger" icon={{ name: "trash-alt" }} isDisabled={true} />;
  }
  return <></>;
};
