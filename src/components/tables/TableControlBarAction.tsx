import { useRouter } from 'next/navigation';
import { type ComponentType, type MouseEvent, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';

import { Tooltip } from '~/components/floating/Tooltip';
import { type DataTableDatum } from '~/components/tables';

type TableControlBarActionButtonProps = {
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export type TableControlBarActionConfig<D extends DataTableDatum> = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (ids: string[]) => Promise<MutationActionResponse<any>>;
  readonly button: ComponentType<TableControlBarActionButtonProps>;
  readonly errorMessage: string;
  readonly logErrorMessage?: string;
  readonly rowFilter: (row: D) => boolean;
  readonly successMessage?: string;
  readonly tooltipLabel: (numSelected: number) => string;
};

export interface TableControlBarActionProps<D extends DataTableDatum> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly action: (ids: string[]) => Promise<MutationActionResponse<any>>;
  readonly areTooltipsInPortal?: boolean;
  readonly button: ComponentType<TableControlBarActionButtonProps>;
  readonly errorMessage: string;
  readonly isDisabled?: boolean;
  readonly logErrorMessage?: string;
  readonly rowFilter: (row: D) => boolean;
  readonly rows: D[];
  readonly successMessage?: string;
  readonly tooltipLabel: (numSelected: number) => string;
}

export const TableControlBarAction = <D extends DataTableDatum>({
  action,
  areTooltipsInPortal,
  button,
  errorMessage,
  isDisabled,
  logErrorMessage,
  rowFilter,
  rows,
  successMessage,
  tooltipLabel,
}: TableControlBarActionProps<D>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isPending, transition] = useTransition();

  const Btn = button;

  const filtered = rows.filter(rowFilter);
  return (
    <Tooltip
      className='text-sm'
      content={tooltipLabel(filtered.length)}
      isDisabled={filtered.length === 0 || isDisabled === true}
      isInPortal={areTooltipsInPortal}
      offset={{ mainAxis: 6 }}
      placement='top-start'
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
            return toast.error('There was an updating the experiences.');
          }
          transition(() => {
            router.refresh();
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
