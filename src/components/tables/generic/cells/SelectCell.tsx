import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import type { ApiClientErrorJson } from "~/api";
import { isApiClientErrorJson } from "~/api";
import { type MenuItemInstance } from "~/components/menus";
import { type TableModel } from "~/components/tables/types";

type AttributeValue<M extends TableModel, N extends keyof M> = M[N];

interface BaseSelectProps<
  O extends { isMulti?: boolean },
  M extends TableModel,
  N extends keyof M,
> {
  readonly menuClassName: string;
  readonly inputClassName: string;
  readonly value: M[N];
  readonly options: O;
  readonly onChange: (value: NonNullable<M[N]>, params: { item: MenuItemInstance }) => void;
}

interface SelectCellProps<
  O extends { isMulti?: boolean },
  M extends TableModel,
  N extends keyof M,
  T,
> {
  readonly inputClassName?: string;
  readonly errorMessage: string;
  readonly model: M;
  readonly options: O;
  readonly component: React.ComponentType<BaseSelectProps<O, M, N>>;
  readonly attribute: N;
  readonly action: (value: NonNullable<M[N]>) => Promise<T | ApiClientErrorJson>;
}

export const SelectCell = <
  O extends { isMulti?: boolean },
  M extends TableModel,
  N extends keyof M,
  T,
>({
  model,
  action,
  errorMessage,
  options,
  attribute,
  inputClassName = "w-full",
  component: Component,
}: SelectCellProps<O, M, N, T>): JSX.Element => {
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
      options={{ ...options, isClearable: true }}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);

        let response: T | ApiClientErrorJson | undefined = undefined;
        try {
          response = await action(v);
        } catch (e) {
          logger.error(
            `There was an error updating the ${String(attribute)} of the ${model.id}:\n${e}`,
            {
              error: e,
              value: v,
            },
          );
          toast.error(errorMessage);
        } finally {
          item.setLoading(false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(`There was an error updating the ${String(attribute)} of the ${model.id}.`, {
            response,
            value: v,
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
  );
};
