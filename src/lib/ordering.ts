import { ReadonlyURLSearchParams } from 'next/navigation';

import { z } from 'zod';

import { parseQueryParams } from '~/integrations/http';

export const Orders = ['asc', 'desc'] as const;

export type Order = (typeof Orders)[number];

/**
 * Represents an ordering by a single field; ordering by multiple fields is not supported.
 */
export type Ordering<I extends string = string, O extends Order = Order> = { order: O; orderBy: I };

type ParseOrderingOptions<F extends string> = {
  readonly defaultOrdering: Ordering<F>;
  readonly fields: F[];
};

const OrderingSchema = <F extends string>(options: ParseOrderingOptions<F>) =>
  z
    .object({
      order: z.string().optional(),
      orderBy: z.string().optional(),
    })
    .transform(
      ({ order, orderBy }) =>
        ({
          order: order && Orders.includes(order as Order) ? order : options.defaultOrdering.order,
          orderBy:
            orderBy && options.fields.includes(orderBy as F)
              ? orderBy
              : options.defaultOrdering.orderBy,
        }) as Ordering<F>,
    );

export const parseOrdering = <F extends string>(
  params: ReadonlyURLSearchParams | Record<string, string | string[] | undefined> | URLSearchParams,
  { defaultOrdering, fields }: ParseOrderingOptions<F>,
): Ordering<F> => {
  const parsed =
    params instanceof ReadonlyURLSearchParams || params instanceof URLSearchParams
      ? parseQueryParams(params.toString())
      : params;

  const parsedData = OrderingSchema({ defaultOrdering, fields }).safeParse(parsed);
  if (parsedData.success) {
    return parsedData.data;
  }
  return defaultOrdering;
};
