import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { isApiClientErrorJson } from "~/api";

import { Checkbox } from "~/components/input/Checkbox";

import { type VisibleCellProps } from "./types";

export const VisibleCell = <M extends { id: string; visible: boolean }, T>({
  model,
  action,
  errorMessage,
  table,
}: VisibleCellProps<M, T>): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(model.visible);

  useEffect(() => {
    setChecked(model.visible);
  }, [model.visible]);

  return (
    <div className="flex flex-row items-center justify-center">
      <Checkbox
        value={checked}
        onChange={async e => {
          // Set checked state optimistically.
          setChecked(e.target.checked);
          table.setRowLoading(model.id, true);

          let response: Awaited<ReturnType<typeof action>> | null = null;
          try {
            response = await action(model.id, { visible: e.target.checked });
          } catch (e) {
            logger.error(`There was a server error changing the visibility for the model:\n${e}`, {
              error: e,
              model,
            });
            toast.error(errorMessage);
          } finally {
            table.setRowLoading(model.id, false);
          }
          if (isApiClientErrorJson(response)) {
            logger.error("There was a server error changing the visibility for the model.", {
              response,
              model,
            });
            toast.error(errorMessage);
          }
          /* Refresh the state from the server regardless of whether or not the request succeeded.
             In the case the request failed, this is required to revert the changes back to their
             original state. */
          transition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
};

export default VisibleCell;
