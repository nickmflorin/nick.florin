import { IconButton } from "~/components/buttons";

export interface DeleteManyButtonPlaceholderProps {
  readonly isCheckable?: boolean;
}

export const DeleteManyButtonPlaceholder = ({
  isCheckable = true,
}: DeleteManyButtonPlaceholderProps) => {
  if (isCheckable) {
    return <IconButton.Danger icon={{ name: "trash-alt" }} isDisabled={true} />;
  }
  return <></>;
};
