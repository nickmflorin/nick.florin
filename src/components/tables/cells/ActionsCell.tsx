import { useState } from "react";

import { logger } from "~/application/logger";
import { IconButton } from "~/components/buttons";

interface ActionsCellProps {
  readonly deleteIsDisabled?: boolean;
  readonly onEdit: () => void;
  readonly onDeleteError: (e: Error) => void;
  readonly onDeleteSuccess: () => void;
  readonly onDelete: () => Promise<void>;
}

export const ActionsCell = ({
  deleteIsDisabled,
  onEdit,
  onDelete,
  onDeleteError,
  onDeleteSuccess,
}: ActionsCellProps): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-row justify-center gap-[4px]">
      <IconButton.Transparent
        icon={{ name: "pen" }}
        options={{ as: "button" }}
        className="text-blue-500 rounded-full hover:text-blue-600"
        disabledClassName="text-disabled"
        loadingClassName="text-gray-400"
        isLoading={loading}
        onClick={() => onEdit()}
      />
      <IconButton.Transparent
        icon={{ name: "trash-alt" }}
        className="text-red-500 rounded-full hover:text-red-600"
        disabledClassName="text-disabled"
        loadingClassName="text-gray-400"
        isLoading={loading}
        isDisabled={deleteIsDisabled}
        onClick={async () => {
          setLoading(true);
          let success = false;
          try {
            await onDelete();
            success = true;
          } catch (e) {
            logger.error(e);
            onDeleteError(e as Error);
          } finally {
            setLoading(false);
          }
          if (success) {
            onDeleteSuccess();
          }
        }}
      />
    </div>
  );
};

export default ActionsCell;
