import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import type { ApiClientErrorJson } from "~/api";
import { isApiClientErrorJson } from "~/api";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

import { type EditableStringCellProps } from "./types";

export const EditableStringCell = <
  M extends { id: string } & { [key in K]: string | null },
  K extends keyof M,
  P extends { [key in K]: string },
  T,
>({
  model,
  field,
  errorMessage,
  table,
  action,
}: EditableStringCellProps<M, K, P, T>): JSX.Element => {
  const router = useRouter();

  const input = useReadWriteTextInput();

  useEffect(() => {
    input.current.setValue(model[field] ?? "");
  }, [model, field, input]);

  return (
    <ReadWriteTextInput
      ref={input}
      initialValue={model[field] ?? ""}
      onPersist={async value => {
        table.setRowLoading(model.id as M["id"], true);

        let response: T | ApiClientErrorJson | null = null;
        try {
          response = await action({ [field]: value } as P);
        } catch (e) {
          logger.error(
            `There was a server error updating the field '${String(field)}' for the model:\n${e}`,
            {
              error: e,
              field,
              model,
            },
          );
          toast.error(errorMessage);
        } finally {
          table.setRowLoading(model.id as M["id"], false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            `There was a client error updating the field '${String(field)}' for the model.`,
            {
              response,
              field,
              model,
            },
          );
          toast.error(errorMessage);
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        router.refresh();
      }}
    />
  );
};

export default EditableStringCell;
