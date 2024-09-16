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
} from "~/components/input/select";
import { type TableModel } from "~/components/tables/types";

type AttributeValue<M extends TableModel, N extends keyof M> = M[N] & AllowedSelectValue;

interface BaseSelectProps<B extends SelectBehaviorType, M extends TableModel, N extends keyof M> {
  readonly isClearable?: boolean;
  readonly menuClassName: string;
  readonly inputClassName: string;
  readonly value: M[N] & AllowedSelectValue;
  readonly behavior: B;
  readonly onChange: DataSelectChangeHandler<
    M,
    { behavior: B; getItemValue: (m: M) => AttributeValue<M, N> }
  >;
}

interface SelectCellProps<
  B extends SelectBehaviorType,
  M extends TableModel,
  N extends keyof M,
  T,
> {
  readonly inputClassName?: string;
  readonly errorMessage: string;
  readonly model: M;
  readonly behavior: B;
  readonly component: React.ComponentType<BaseSelectProps<B, M, N>>;
  readonly attribute: N;
  readonly action: (value: M[N] & AllowedSelectValue) => Promise<T | ApiClientErrorJson>;
}

export const SelectCell = <
  B extends SelectBehaviorType,
  M extends TableModel,
  N extends keyof M,
  T,
>({
  model,
  behavior,
  action,
  errorMessage,
  attribute,
  inputClassName = "w-full",
  component: Component,
}: SelectCellProps<B, M, N, T>): JSX.Element => {
  const [value, setValue] = useState<AttributeValue<M, N> & AllowedSelectValue>(
    model[attribute] as M[N] & AllowedSelectValue,
  );
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    /* The type coercion around this is not ideal - and this was only done to make this work with
       the newly created selects.  We should backtrack on this component itself, and rather use
       a more explicit/less abstract approach. */
    setValue(model[attribute] as M[N] & AllowedSelectValue);
  }, [model, attribute]);

  return (
    <Component
      inputClassName={inputClassName}
      menuClassName="max-h-[260px]"
      value={value}
      isClearable
      behavior={behavior}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v as M[N] & AllowedSelectValue);
        item?.setLoading(true);

        let response: T | ApiClientErrorJson | undefined = undefined;
        try {
          response = await action(v as M[N] & AllowedSelectValue);
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
