import { type Ordering } from '~/lib/ordering';

import { type ActionVisibility } from '~/actions/visibility';

export type FlattenedControls<
  I extends string[],
  F extends Record<string, unknown>,
  OF extends string,
> = {
  readonly includes: I;
  readonly limit?: number;
  readonly page?: number;
  readonly visibility: ActionVisibility;
} & Partial<F> &
  Partial<Ordering<OF>>;

export type Controls<I extends string[], F extends Record<string, unknown>, OF extends string> = {
  readonly filters: Partial<F>;
  readonly includes: I;
  readonly limit?: number;
  readonly ordering?: Ordering<OF>;
  readonly page?: number;
  readonly visibility: ActionVisibility;
};
