import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { slugify } from "~/lib/formatters";
import { type ApiClientErrorJson, isApiClientErrorJson } from "~/api";
import { IconButton } from "~/components/buttons";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import type * as types from "~/components/tables/types";

export interface SlugCellProps<M extends { id: string; slug: string }, T> {
  readonly model: M;
  readonly table: types.CellTableInstance<M>;
  readonly modelType: string;
  readonly getSluggifiedFieldValue: (m: M) => string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (id: string, value: string | null) => Promise<T | ApiClientErrorJson>;
}

export type SlugCellComponent = {
  <M extends { id: string; slug: string }, T>(props: SlugCellProps<M, T>): JSX.Element;
};

export const SlugCell = <M extends { id: string; slug: string }, T>({
  model,
  table,
  modelType,
  action,
  getSluggifiedFieldValue,
}: SlugCellProps<M, T>): JSX.Element => {
  const input = useReadWriteTextInput();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    input.current.setValue(model.slug);
  }, [model, input]);

  return (
    <div className="flex flex-row justify-between gap-[12px]">
      <ReadWriteTextInput
        ref={input}
        initialValue={model.slug}
        onPersist={async slug => {
          table.setRowLoading(model.id, true);

          let response: Awaited<ReturnType<typeof action>> | null = null;
          try {
            response = await action(model.id, slug);
          } catch (e) {
            logger.error(
              `There was a server error updating the slug for the ${modelType} with ID '${model.id}':\n${e}`,
              {
                error: e,
                model: model.id,
                modelType,
                slug,
              },
            );
            toast.error(`There was an error updating the ${modelType}.`);
          } finally {
            table.setRowLoading(model.id, false);
          }
          if (isApiClientErrorJson(response)) {
            logger.error(
              `There was a client error updating the slug for the ${modelType} with ID '${model.id}'.`,
              {
                response,
                model,
              },
            );
            toast.error(`There was an error updating the ${modelType}.`);
          }
          /* Refresh the state from the server regardless of whether or not the request succeeded.
             In the case the request failed, this is required to revert the changes back to their
             original state. */
          transition(() => {
            router.refresh();
          });
        }}
      />
      <IconButton.Transparent
        icon={{ name: "refresh" }}
        className="text-blue-600"
        disabledClassName="text-disabled"
        isLoading={loading}
        isDisabled={model.slug === slugify(getSluggifiedFieldValue(model))}
        onClick={async () => {
          setLoading(true);
          try {
            await action(model.id, null);
          } catch (e) {
            const logger = (await import("~/application/logger")).logger;
            logger.error(
              `There was an error updating the slug for the ${modelType} with ID '${model.id}':\n${e}`,
              {
                error: e,
                model: model.id,
                modelType,
                slug: null,
              },
            );
            toast.error(`There was an error updating the ${modelType}.`);
          } finally {
            setLoading(false);
            /* Refresh regardless of the outcome because if there is an error, the field needs to
               be reverted.  We may consider manually applying the reversion without a round trip
               server request in the future. */
            transition(() => {
              router.refresh();
            });
          }
        }}
      />
    </div>
  );
};

export default SlugCell;
