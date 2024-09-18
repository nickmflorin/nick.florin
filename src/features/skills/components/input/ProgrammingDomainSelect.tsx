import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { ProgrammingDomains } from "~/database/model";

import type { SelectBehaviorType } from "~/components/input/select";
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

export const ProgrammingDomainSelect = <B extends SelectBehaviorType>({
  behavior,
  ...props
}: ProgrammingDomainSelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
    {...props}
    options={{ behavior, getItemValue }}
    getItemValueLabel={m => m.label}
    data={[...ProgrammingDomains.models]}
    itemRenderer={m => m.label}
  />
);
