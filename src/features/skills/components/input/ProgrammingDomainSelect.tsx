import { forwardRef, type ForwardedRef } from "react";

import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { ProgrammingDomains } from "~/database/model";

import type { DataSelectInstance, SelectBehaviorType } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof ProgrammingDomains>;

const getItemValue = (m: M) => m.value;

export interface ProgrammingDomainSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "data"
  > {
  readonly behavior: B;
}

export const ProgrammingDomainSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: ProgrammingDomainSelectProps<B>,
    ref: ForwardedRef<DataSelectInstance<M, { behavior: B; getItemValue: typeof getItemValue }>>,
  ): JSX.Element => (
    <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.label}
      data={[...ProgrammingDomains.models]}
      itemRenderer={m => m.label}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: ProgrammingDomainSelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<M, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
