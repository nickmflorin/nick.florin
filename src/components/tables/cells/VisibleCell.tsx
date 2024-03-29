import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { Checkbox } from "~/components/input/Checkbox";

import { type VisibleCellProps } from "./types";

export const VisibleCell = <M extends { id: string; visible: boolean }>({
  model,
  action,
  errorMessage,
  table,
}: VisibleCellProps<M>): JSX.Element => {
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
          try {
            await action(model.id, { visible: e.target.checked });
          } catch (e) {
            const logger = (await import("~/application/logger")).logger;
            logger.error(`There was an error changing the visibility for the model:\n${e}`, {
              error: e,
              model,
            });
            toast.error(errorMessage);
          } finally {
            table.setRowLoading(model.id, false);
          }
          transition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
};

export default VisibleCell;
