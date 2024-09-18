import { ReadonlyURLSearchParams } from "next/navigation";

import { z } from "zod";

import { parseQueryParams } from "~/integrations/http";

export const Orders = ["asc", "desc"] as const;

export type Order = (typeof Orders)[number];

// Right now, we are only supporting single field ordering.
export type Ordering<I extends string> = { orderBy: I; order: Order };

type ParseOrderingOptions<F extends string> = {
  readonly fields: F[];
  readonly defaultOrdering: Ordering<F>;
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
  params: ReadonlyURLSearchParams | URLSearchParams | Record<string, string | string[] | undefined>,
  { fields, defaultOrdering }: ParseOrderingOptions<F>,
): Ordering<F> => {
  const parsed =
    params instanceof ReadonlyURLSearchParams || params instanceof URLSearchParams
      ? parseQueryParams(params.toString())
      : params;

  const parsedData = OrderingSchema({ fields, defaultOrdering }).safeParse(parsed);
  if (parsedData.success) {
    return parsedData.data;
  }
  return defaultOrdering;
};
