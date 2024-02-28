import { IconButton } from "~/components/buttons";

interface ActionsCellProps {
  readonly deleteIsDisabled?: boolean;
  readonly isDeleting?: boolean;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

export const ActionsCell = ({
  deleteIsDisabled,
  isDeleting,
  onEdit,
  onDelete,
}: ActionsCellProps): JSX.Element => (
  <div className="flex flex-row justify-center gap-[4px]">
    <IconButton.Transparent
      icon={{ name: "pen" }}
      options={{ as: "button" }}
      className="text-blue-500 rounded-full hover:text-blue-600"
      disabledClassName="text-disabled"
      loadingClassName="text-gray-400"
      onClick={() => onEdit()}
    />
    <IconButton.Transparent
      icon={{ name: "trash-alt" }}
      className="text-red-500 rounded-full hover:text-red-600"
      disabledClassName="text-disabled"
      loadingClassName="text-gray-400"
      isLoading={isDeleting}
      isDisabled={deleteIsDisabled}
      onClick={() => onDelete()}
    />
  </div>
);

export default ActionsCell;
