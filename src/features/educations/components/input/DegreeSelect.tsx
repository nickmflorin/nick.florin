import { forwardRef, type ForwardedRef } from "react";

import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { Degrees } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof Degrees>;

const getModelValue = (m: M) => m.value;

export type DegreeSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  M,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface DegreeSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getModelValue: typeof getModelValue }>,
    "options" | "data" | "getModelValueLabel" | "itemRenderer"
  > {
  readonly behavior: B;
}

export const DegreeSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: DegreeSelectProps<B>,
    ref: ForwardedRef<DegreeSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<M, { behavior: B; getModelValue: typeof getModelValue }>
      {...props}
      ref={ref}
      options={{ behavior, getModelValue }}
      getModelValueLabel={m => m.shortLabel}
      data={[...Degrees.models]}
      itemRenderer={m => m.label}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: DegreeSelectProps<B> & { readonly ref?: ForwardedRef<DegreeSelectInstance<B>> },
  ): JSX.Element;
};
