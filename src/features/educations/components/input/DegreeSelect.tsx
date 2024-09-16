import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { Degrees } from "~/prisma/model";

import type { SelectBehaviorType } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof Degrees>;

const getItemValue = (m: M) => m.value;

export interface DegreeSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "data"
  > {
  readonly behavior: B;
}

export const DegreeSelect = <B extends SelectBehaviorType>({
  behavior,
  ...props
}: DegreeSelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
    {...props}
    options={{ behavior, getItemValue }}
    getItemValueLabel={m => m.shortLabel}
    data={[...Degrees.models]}
    itemRenderer={m => m.label}
  />
);
