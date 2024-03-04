import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { IconButton } from "~/components/buttons";
import { useReplaceableParams } from "~/hooks";

interface ActionsCellProps {
  readonly deleteIsDisabled?: boolean;
  readonly editQueryParam: string;
  readonly editQueryValue: string;
  readonly deleteErrorMessage: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly deleteAction: () => Promise<any>;
}

export const ActionsCell = ({
  deleteIsDisabled,
  editQueryParam,
  editQueryValue,
  deleteErrorMessage,
  deleteAction,
}: ActionsCellProps): JSX.Element => {
  const { refresh } = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const [_, replace] = useReplaceableParams();
  const [__, transition] = useTransition();

  return (
    <div className="flex flex-row justify-end gap-[4px]">
      <IconButton.Transparent
        icon={{ name: "pen" }}
        options={{ as: "button" }}
        className="text-blue-500 rounded-full hover:text-blue-600"
        disabledClassName="text-disabled"
        loadingClassName="text-gray-400"
        onClick={() => replace(editQueryParam, editQueryValue)}
      />
      <IconButton.Transparent
        icon={{ name: "trash-alt" }}
        className="text-red-500 rounded-full hover:text-red-600"
        disabledClassName="text-disabled"
        loadingClassName="text-gray-400"
        isLoading={isDeleting}
        isDisabled={deleteIsDisabled}
        onClick={async () => {
          let success = true;
          setIsDeleting(true);
          try {
            await deleteAction();
          } catch (e) {
            success = false;
            logger.error(deleteErrorMessage, {
              error: e,
            });
            toast.error("There was an error deleting the experience.");
          } finally {
            setIsDeleting(false);
          }
          if (success) {
            transition(() => {
              refresh();
            });
          }
        }}
      />
    </div>
  );
};

export default ActionsCell;
