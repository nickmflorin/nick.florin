import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

import { type EditableStringCellProps } from "./types";

export const EditableStringCell = <
  M extends { id: string } & { [key in K]: string | null },
  K extends keyof M,
  P extends { [key in K]: string },
>({
  model,
  field,
  errorMessage,
  table,
  action,
}: EditableStringCellProps<M, K, P>): JSX.Element => {
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
        try {
          await action({ [field]: value } as P);
        } catch (e) {
          logger.error(e);
          toast.error(errorMessage);
        } finally {
          table.setRowLoading(model.id as M["id"], false);
          /* Refresh regardless of the outcome because if there is an error, the field needs to
             be reverted.  We may consider manually applying the reversion without a round trip
             server request in the future. */
          router.refresh();
        }
      }}
    />
  );
};

export default EditableStringCell;
