import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";

import { UnreachableCaseError } from "~/application/errors";
import { parseOrdering, type Order, type Ordering } from "~/lib/ordering";

import { useReferentialCallback } from "~/hooks";

const DEFAULT_ORDER = "asc";

export interface UseOrderingStateConfig<I extends string> {
  readonly defaultOrder?: Order;
  readonly defaultOrdering?: never;
  readonly initialOrdering?: Ordering<I> | null;
  readonly fields?: never;
  readonly clearOrderingOnCycleComplete?: boolean;
  readonly useQueryParams?: false;
}

export interface UseOrderingQueryConfig<I extends string> {
  readonly defaultOrder?: Order;
  readonly defaultOrdering: Ordering<I>;
  readonly initialOrdering?: never;
  readonly fields: I[];
  readonly clearOrderingOnCycleComplete?: boolean;
  readonly useQueryParams: true;
}

export type UseOrderingConfig<I extends string> =
  | UseOrderingStateConfig<I>
  | UseOrderingQueryConfig<I>;

const getOrderCycle = (defaultOrder: Order): [Order, Order] =>
  defaultOrder === "asc" ? ["asc", "desc"] : ["desc", "asc"];

type UpdateOrderParams<I extends string> =
  | {
      readonly field: I;
      readonly order?: never;
    }
  | {
      readonly field?: never;
      readonly order: Order | null;
    }
  | {
      readonly field: I;
      readonly order: Order | null;
    };

export const useOrdering = <I extends string>(config?: UseOrderingConfig<I>) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const {
    defaultOrdering,
    initialOrdering: _initialOrdering,
    clearOrderingOnCycleComplete = false,
    useQueryParams,
    defaultOrder = DEFAULT_ORDER,
    fields,
  } = useMemo(() => config ?? {}, [config]);

  const initialOrdering = useMemo(
    () =>
      useQueryParams
        ? parseOrdering(searchParams, { fields, defaultOrdering })
        : (_initialOrdering ?? null),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [],
  );

  const [ordering, setOrdering] = useState<Ordering<I> | null>(initialOrdering);

  const updateOrdering = useCallback(
    (ording: Ordering<I> | null, { field, order }: UpdateOrderParams<I>): Ordering<I> | null => {
      if (ording === null) {
        if (field) {
          return { orderBy: field, order: order ?? defaultOrder };
        }
        /* Here, we cannot update the ordering without a field because there is no existing field
           in the existing order in state. */
        return ording;
      } else if (field && order) {
        return { orderBy: field, order };
      } else if (field) {
        if (field === ording.orderBy) {
          const cycle = getOrderCycle(defaultOrder);
          if (ording.order === cycle[0]) {
            return { ...ording, order: cycle[1] };
          } else if (clearOrderingOnCycleComplete) {
            return null;
          }
          return { ...ording, order: cycle[0] };
        }
        return { orderBy: field, order: defaultOrder };
      } else if (order) {
        return { ...ording, order };
      }
      throw new UnreachableCaseError();
    },
    [defaultOrder, clearOrderingOnCycleComplete],
  );

  const updateOrderingInState = useReferentialCallback((params: UpdateOrderParams<I>) => {
    const updatedOrdering = updateOrdering(ordering, params);
    setOrdering(updatedOrdering);
    if (useQueryParams) {
      const params = new URLSearchParams(searchParams?.toString());
      if (updatedOrdering) {
        params.set("orderBy", updatedOrdering.orderBy);
        params.set("order", updatedOrdering.order);
      } else {
        params.delete("orderBy");
        params.delete("order");
      }
      replace(`${pathname}?${params.toString()}`);
    }
  });

  return [ordering, updateOrderingInState, updateOrdering] as const;
};
