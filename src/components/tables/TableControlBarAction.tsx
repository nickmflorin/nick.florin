import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions";

import { Tooltip } from "~/components/floating/Tooltip";
import { type DataTableDatum } from "~/components/tables";

type TableControlBarActionButtonProps = {
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export type TableControlBarActionConfig<D extends DataTableDatum> = {
  readonly button: React.ComponentType<TableControlBarActionButtonProps>;
  readonly errorMessage: string;
  readonly logErrorMessage?: string;
  readonly successMessage?: string;
  readonly tooltipLabel: (numSelected: number) => string;
  readonly rowFilter: (row: D) => boolean;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (ids: string[]) => Promise<MutationActionResponse<any>>;
};

export interface TableControlBarActionProps<D extends DataTableDatum> {
  readonly button: React.ComponentType<TableControlBarActionButtonProps>;
  readonly rows: D[];
  readonly isDisabled?: boolean;
  readonly tooltipsInPortal?: boolean;
  readonly errorMessage: string;
  readonly logErrorMessage?: string;
  readonly successMessage?: string;
  readonly tooltipLabel: (numSelected: number) => string;
  readonly rowFilter: (row: D) => boolean;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (ids: string[]) => Promise<MutationActionResponse<any>>;
}

export const TableControlBarAction = <D extends DataTableDatum>({
  button,
  isDisabled,
  tooltipsInPortal,
  errorMessage,
  logErrorMessage,
  successMessage,
  rows,
  rowFilter,
  tooltipLabel,
  action,
}: TableControlBarActionProps<D>) => {
  const { refresh } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, transition] = useTransition();

  const Btn = button;

  const filtered = rows.filter(rowFilter);
  return (
    <Tooltip
      placement="top-start"
      inPortal={tooltipsInPortal}
      offset={{ mainAxis: 6 }}
      content={tooltipLabel(filtered.length)}
      className="text-sm"
      isDisabled={filtered.length === 0 || isDisabled === true}
    >
      <Btn
        isDisabled={filtered.length === 0 || isDisabled === true}
        isLoading={isLoading || isPending}
        onClick={async () => {
          let response: Awaited<ReturnType<typeof action>> | null = null;
          setIsLoading(true);
          try {
            response = await action(filtered.map(row => row.id));
          } catch (e) {
            logger.errorUnsafe(e, logErrorMessage ?? errorMessage, {
              rowIds: filtered.map(row => row.id),
            });
            setIsLoading(false);
            return toast.error(errorMessage);
          }
          const { error } = response;
          if (error) {
            logger.error(error, logErrorMessage ?? errorMessage, {
              rowIds: filtered.map(row => row.id),
            });
            setIsLoading(false);
            return toast.error("There was an updating the experiences.");
          }
          transition(() => {
            refresh();
            setIsLoading(false);
            if (successMessage) {
              toast.success(successMessage);
            }
          });
        }}
      />
    </Tooltip>
  );
};
