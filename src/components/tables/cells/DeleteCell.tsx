import { useState } from "react";

import { logger } from "~/application/logger";
import { IconButton } from "~/components/buttons";

interface DeleteCellProps {
  readonly isDisabled?: boolean;
  readonly onError: (e: Error) => void;
  readonly onSuccess: () => void;
  readonly onDelete: () => Promise<void>;
}

export const DeleteCell = ({
  isDisabled,
  onDelete,
  onError,
  onSuccess,
}: DeleteCellProps): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-row justify-center">
      <IconButton.Transparent
        icon={{ name: "trash-alt" }}
        className="text-red-500 rounded-full hover:text-red-600"
        disabledClassName="text-disabled"
        loadingClassName="text-gray-400"
        isLoading={loading}
        isDisabled={isDisabled}
        onClick={async () => {
          setLoading(true);
          let success = false;
          try {
            await onDelete();
            success = true;
          } catch (e) {
            logger.error(e);
            onError(e as Error);
          } finally {
            setLoading(false);
          }
          if (success) {
            onSuccess();
          }
        }}
      />
    </div>
  );
};

export default DeleteCell;
