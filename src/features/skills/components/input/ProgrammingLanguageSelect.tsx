import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { ProgrammingLanguages } from "~/database/model";

import type { SelectBehaviorType } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";

type M = EnumeratedLiteralsModel<typeof ProgrammingLanguages>;

const getItemValue = (m: M) => m.value;

export interface ProgrammingLanguageSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<M, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "data"
  > {
  readonly behavior: B;
}

export const ProgrammingLanguageSelect = <B extends SelectBehaviorType>({
  behavior,
  ...props
}: ProgrammingLanguageSelectProps<B>): JSX.Element => (
  <DataSelect<M, { behavior: B; getItemValue: typeof getItemValue }>
    {...props}
    options={{ behavior, getItemValue }}
    getItemValueLabel={m => m.label}
    getItemIcon={m => m.icon}
    data={[...ProgrammingLanguages.models]}
    itemRenderer={m => m.label}
  />
);
