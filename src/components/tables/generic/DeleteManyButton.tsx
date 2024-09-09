import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "react-toastify";

import type * as types from "../types";

import { logger } from "~/application/logger";

import { type ApiClientErrorJson, isApiClientErrorJson } from "~/api";

import { IconButton } from "~/components/buttons";

import { useTableView } from "../hooks";

export interface DeleteManyButtonProps<T extends types.TableModel> {
  readonly action: (ids: T["id"][]) => Promise<ApiClientErrorJson | void>;
}

export const DeleteManyButton = <T extends types.TableModel>({
  action,
}: DeleteManyButtonProps<T>) => {
  const { id, checked, isCheckable } = useTableView();
  const [isDeleting, setIsDeleting] = useState(false);
  const { refresh } = useRouter();

  if (isCheckable) {
    return (
      <IconButton.Danger
        icon={{ name: "trash-alt" }}
        isDisabled={checked.length === 0}
        isLoading={isDeleting}
        onClick={async () => {
          setIsDeleting(true);
          let response: Awaited<ReturnType<typeof action>> | null = null;
          try {
            response = await action(checked);
          } catch (e) {
            logger.error(`There was a server error deleting the rows of table '${id}':\n${e}`, {
              error: e,
              tableId: id,
              rows: checked,
            });
            toast.error("There was an error deleting the rows.");
          } finally {
            setIsDeleting(false);
          }
          if (response && isApiClientErrorJson(response)) {
            logger.error(`There was a client error deleting the rows of table '${id}'.`, {
              error: response,
              tableId: id,
              rows: checked,
            });
            toast.error("There was an error deleting the rows.");
          } else {
            refresh();
          }
        }}
      />
    );
  }
  return <></>;
};
