import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { toast } from "react-toastify";

import type * as types from "../types";

import { logger } from "~/application/logger";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

interface EditableStringCellProps<
  M extends { id: string } & { [key in K]: string | null },
  K extends keyof M,
  P extends { [key in K]: string },
> {
  readonly model: M;
  readonly field: K;
  readonly table: types.TableInstance<M>;
  readonly errorMessage: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (data: P) => Promise<any>;
}

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
