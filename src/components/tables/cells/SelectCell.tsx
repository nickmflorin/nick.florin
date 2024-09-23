import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import type { ApiClientErrorJson } from "~/api";
import { isApiClientErrorJson } from "~/api";

import type {
  AllowedSelectValue,
  DataSelectChangeHandler,
  SelectBehaviorType,
  SelectValue,
  DataSelectModel,
} from "~/components/input/select";
import { type TableModel } from "~/components/tables/types";

interface BaseSelectProps<
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  V extends AllowedSelectValue,
> {
  readonly isClearable?: boolean;
  readonly inputClassName: string;
  readonly value: SelectValue<V, B>;
  readonly behavior: B;
  readonly onChange: DataSelectChangeHandler<M, { behavior: B; getItemValue: (m: M) => V }>;
}

interface SelectCellProps<
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  V extends AllowedSelectValue,
  T,
> {
  readonly inputClassName?: string;
  readonly errorMessage: string;
  readonly model: TableModel;
  readonly behavior: B;
  readonly attribute: string;
  readonly value: SelectValue<V, B>;
  readonly component: React.ComponentType<BaseSelectProps<B, M, V>>;
  readonly action: (value: SelectValue<V, B>) => Promise<T | ApiClientErrorJson>;
}

export const SelectCell = <
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  V extends AllowedSelectValue,
  T,
>({
  model,
  behavior,
  attribute,
  action,
  value: _value,
  errorMessage,
  inputClassName = "w-full",
  component: Component,
}: SelectCellProps<B, M, V, T>): JSX.Element => {
  const [value, setValue] = useState<SelectValue<V, B>>(_value);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(_value);
  }, [_value]);

  return (
    <Component
      inputClassName={inputClassName}
      value={value}
      isClearable
      behavior={behavior}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);

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
          item?.setLoading(false);
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
