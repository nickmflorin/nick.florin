import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { isApiClientErrorJson } from "~/api";

import { Checkbox } from "~/components/input/Checkbox";

import { type HighlightedCellProps } from "./types";

export const HighlightedCell = <M extends { id: string; highlighted: boolean }, T>({
  model,
  action,
  errorMessage,
  table,
}: HighlightedCellProps<M, T>): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(model.highlighted);

  useEffect(() => {
    setChecked(model.highlighted);
  }, [model.highlighted]);

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
            response = await action(model.id, { highlighted: e.target.checked });
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

export default HighlightedCell;
