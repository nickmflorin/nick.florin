import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { UnreachableCaseError } from '~/application/errors';
import { type Order, type Ordering, parseOrdering } from '~/lib/ordering';

import { useReferentialCallback } from '~/hooks';

const DEFAULT_ORDER = 'asc';

export interface UseOrderingStateConfig<I extends string> {
  readonly clearOrderingOnCycleComplete?: boolean;
  readonly defaultOrder?: Order;
  readonly defaultOrdering?: never;
  readonly fields?: never;
  readonly initialOrdering?: null | Ordering<I>;
  readonly useQueryParams?: false;
}

export interface UseOrderingQueryConfig<I extends string> {
  readonly clearOrderingOnCycleComplete?: boolean;
  readonly defaultOrder?: Order;
  readonly defaultOrdering: Ordering<I>;
  readonly fields: I[];
  readonly initialOrdering?: never;
  readonly useQueryParams: true;
}

export type UseOrderingConfig<I extends string> =
  UseOrderingQueryConfig<I> | UseOrderingStateConfig<I>;

const getOrderCycle = (defaultOrder: Order): [Order, Order] =>
  defaultOrder === 'asc' ? ['asc', 'desc'] : ['desc', 'asc'];

type UpdateOrderParams<I extends string> =
  | {
      readonly field: I;
      readonly order: null | Order;
    }
  | {
      readonly field: I;
      readonly order?: never;
    }
  | {
      readonly field?: never;
      readonly order: null | Order;
    };

export const useOrdering = <I extends string>(config?: UseOrderingConfig<I>) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    clearOrderingOnCycleComplete = false,
    defaultOrder = DEFAULT_ORDER,
    defaultOrdering,
    fields,
    initialOrdering: _initialOrdering,
    useQueryParams,
  } = useMemo(() => config ?? {}, [config]);

  /* The initial ordering is resolved once, when the hook first runs.  A lazy state initializer is
     used rather than a memo so that later changes to the query parameters do not reset an ordering
     the user has since chosen. */
  const [ordering, setOrdering] = useState<null | Ordering<I>>(() =>
    useQueryParams
      ? parseOrdering(searchParams, { defaultOrdering, fields })
      : (_initialOrdering ?? null),
  );

  const updateOrdering = useCallback(
    (ording: null | Ordering<I>, { field, order }: UpdateOrderParams<I>): null | Ordering<I> => {
      if (ording === null) {
        if (field) {
          return { order: order ?? defaultOrder, orderBy: field };
        }
        return ording;
      } else if (field && order) {
        return { order, orderBy: field };
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
        return { order: defaultOrder, orderBy: field };
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
      const queryParams = new URLSearchParams(searchParams.toString());
      if (updatedOrdering) {
        queryParams.set('orderBy', updatedOrdering.orderBy);
        queryParams.set('order', updatedOrdering.order);
      } else {
        queryParams.delete('orderBy');
        queryParams.delete('order');
      }
      router.replace(`${pathname}?${queryParams.toString()}`);
    }
  });

  return [ordering, updateOrderingInState, updateOrdering] as const;
};
