import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type MenuItemInstance } from "~/components/menus";
import { type TableModel } from "~/components/tables/types";

type AttributeValue<M extends TableModel, N extends keyof M> = M[N];

interface BaseSelectProps<M extends TableModel, N extends keyof M> {
  readonly menuClassName: string;
  readonly inputClassName: string;
  readonly value: M[N];
  readonly onChange: (value: NonNullable<M[N]>, params: { item: MenuItemInstance }) => void;
}

interface SelectCellProps<M extends TableModel, N extends keyof M> {
  readonly inputClassName?: string;
  readonly errorMessage: string;
  readonly model: M;
  readonly component: React.ComponentType<BaseSelectProps<M, N>>;
  readonly attribute: N;
  readonly action: (value: NonNullable<M[N]>) => Promise<void>;
}

export const SelectCell = <M extends TableModel, N extends keyof M>({
  model,
  action,
  errorMessage,
  attribute,
  inputClassName = "w-[300px]",
  component: Component,
}: SelectCellProps<M, N>): JSX.Element => {
  const [value, setValue] = useState<AttributeValue<M, N>>(model[attribute]);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(model[attribute]);
  }, [model, attribute]);

  return (
    <Component
      inputClassName={inputClassName}
      menuClassName="max-h-[260px]"
      value={value}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);
        try {
          await action(v);
        } catch (e) {
          const logger = (await import("~/application/logger")).logger;
          logger.error(
            `There was an error updating the ${String(attribute)} of the ${model.id}:\n${e}`,
            {
              error: e,
            },
          );
          toast.error(errorMessage);
        } finally {
          item.setLoading(false);
        }
        /* Refresh the page state from the server.  This is not entirely necessary, but will
           revert any changes that were made if the request fails. */
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};
