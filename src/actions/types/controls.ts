import { type Ordering } from "~/lib/ordering";

import { type ActionVisibility } from "~/actions/visibility";

export type FlattenedControls<
  I extends string[],
  F extends Record<string, unknown>,
  OF extends string,
> = Partial<F> &
  Partial<Ordering<OF>> & {
    readonly page?: number;
    readonly includes: I;
    readonly limit?: number;
    readonly visibility: ActionVisibility;
  };

export type Controls<I extends string[], F extends Record<string, unknown>, OF extends string> = {
  readonly filters: Partial<F>;
  readonly ordering?: Ordering<OF>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
};
